import { createOrderNumber, parsePrice, truncate } from '../lib/server/format.ts';
import type { Product } from '../lib/types/database.ts';
import { fulfillOrder } from '../lib/server/fulfillment.ts';
import { fetchTransactionStatus } from '../lib/server/midtrans-api.ts';
import { applyPaymentNotification } from '../lib/server/payment-sync.ts';
import { getAvailability } from './catalog.ts';
import { config } from './config.ts';
import { sendMessage, snap, supabase } from './context.ts';

export type TelegramUser = {
	id: number;
	first_name?: string;
	last_name?: string;
	username?: string;
};

export type Invoice = {
	orderNumber: string;
	productName: string;
	total: number;
	paymentUrl: string;
};

export class CheckoutError extends Error {
	/** Pesan aman untuk ditampilkan ke pelanggan. */
	readonly userMessage: string;

	constructor(userMessage: string, options?: { cause?: unknown }) {
		super(userMessage, options);
		this.userMessage = userMessage;
	}
}

function customerName(user: TelegramUser): string {
	const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();

	return fullName || user.username || `Telegram ${user.id}`;
}

/**
 * 1. Simpan invoice: orders + order_items + payments (status pending).
 * 2. Buat transaksi Midtrans Snap; metode pembayaran dipilih pelanggan di halaman Snap.
 * Akun TIDAK dikirim di sini, hanya setelah webhook mengonfirmasi pembayaran.
 */
export async function createInvoice(user: TelegramUser, product: Product): Promise<Invoice> {
	const availability = (await getAvailability([product.id])).get(product.id);

	if (!availability?.available) {
		throw new CheckoutError('Maaf, stok produk ini sedang habis.');
	}

	let price: number;

	try {
		price = parsePrice(product.price, product.name);
	} catch (error) {
		console.error(error);
		throw new CheckoutError('Harga produk ini belum valid. Silakan hubungi admin.');
	}

	const orderNumber = createOrderNumber();
	const name = customerName(user);
	// Telegram tidak menyediakan email; ini hanya placeholder internal.
	const placeholderEmail = `telegram-${user.id}@telegram.invalid`;

	let orderId: string | null = null;
	let paymentId: string | null = null;

	try {
		const { data: order, error: orderError } = await supabase
			.from('orders')
			.insert({
				order_number: orderNumber,
				source: 'telegram',
				customer_name: name,
				customer_email: placeholderEmail,
				customer_phone: null,
				telegram_chat_id: String(user.id),
				status: 'pending',
				currency: 'IDR',
				total_amount: price,
				notes: 'Checkout via bot Telegram'
			})
			.select('id')
			.single();

		if (orderError || !order) {
			throw new Error(`Gagal membuat order: ${orderError?.message ?? 'data kosong'}`);
		}

		orderId = order.id as string;

		const { error: itemError } = await supabase.from('order_items').insert({
			order_id: orderId,
			product_id: product.id,
			product_name: product.name,
			unit_price: price,
			quantity: 1
			// line_total adalah generated column di database; dihitung otomatis.
		});

		if (itemError) throw new Error(`Gagal membuat item order: ${itemError.message}`);

		const { data: payment, error: paymentError } = await supabase
			.from('payments')
			.insert({
				order_id: orderId,
				provider: 'midtrans',
				external_id: orderNumber,
				payment_method: 'snap',
				amount: price,
				status: 'pending'
			})
			.select('id')
			.single();

		if (paymentError || !payment) {
			throw new Error(`Gagal membuat payment: ${paymentError?.message ?? 'data kosong'}`);
		}

		paymentId = payment.id as string;

		const transaction = await snap.createTransaction({
			transaction_details: { order_id: orderNumber, gross_amount: price },
			item_details: [
				{
					id: product.id.slice(0, 50),
					price,
					quantity: 1,
					name: truncate(product.name, 50)
				}
			],
			customer_details: { first_name: truncate(name, 50) }
		});

		if (!transaction.redirect_url) {
			throw new Error('Midtrans tidak mengembalikan redirect_url.');
		}

		const { error: urlError } = await supabase
			.from('payments')
			.update({ redirect_url: transaction.redirect_url })
			.eq('id', paymentId);

		// URL hanya cadangan; kegagalan menyimpannya tidak boleh menggagalkan checkout.
		if (urlError) console.warn('Gagal menyimpan redirect_url:', urlError.message);

		return {
			orderNumber,
			productName: product.name,
			total: price,
			paymentUrl: transaction.redirect_url
		};
	} catch (error) {
		console.error('Checkout gagal:', error);

		if (paymentId) {
			await supabase.from('payments').update({ status: 'failed' }).eq('id', paymentId);
		}

		if (orderId) {
			await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
		}

		throw new CheckoutError('Maaf, invoice gagal dibuat. Silakan coba lagi beberapa saat lagi.', {
			cause: error
		});
	}
}

export type PaymentCheck = 'paid' | 'waiting' | 'closed' | 'not_found';

/**
 * Dipanggil saat pelanggan menekan "Cek Status Pembayaran". Menanyakan status
 * langsung ke Midtrans sehingga tidak bergantung pada webhook/cron. Bila sudah
 * lunas, akun dialokasikan dan dikirim oleh fulfillment (idempoten).
 */
export async function checkPayment(chatId: number, orderNumber: string): Promise<PaymentCheck> {
	const { data: order, error } = await supabase
		.from('orders')
		.select('id, status, telegram_chat_id')
		.eq('order_number', orderNumber)
		.maybeSingle();

	if (error) throw new Error(`Gagal membaca order: ${error.message}`);

	// Order milik chat lain diperlakukan seperti tidak ada.
	if (!order || order.telegram_chat_id !== String(chatId)) return 'not_found';

	if (order.status !== 'paid') {
		const status = await fetchTransactionStatus(config.midtrans, orderNumber);

		if (!status) return 'waiting';

		await applyPaymentNotification(supabase, sendMessage, status);

		const { data: refreshed } = await supabase
			.from('orders')
			.select('status')
			.eq('id', order.id)
			.maybeSingle();

		if (refreshed?.status !== 'paid') {
			return refreshed?.status === 'pending' ? 'waiting' : 'closed';
		}

		return 'paid'; // applyPaymentNotification sudah memenuhi order
	}

	await fulfillOrder(supabase, sendMessage, order.id as string);

	return 'paid';
}
