import { escapeHtml } from './format.ts';
import type { ServiceClient } from './supabase.ts';
import type { SendMessage } from './telegram-api.ts';
import type { AccountDelivery } from '../types/database.ts';

/**
 * Pemenuhan order: assign akun (prioritas pengguna paling sedikit) lalu
 * kirim kredensial ke pelanggan. Semua langkah idempoten, jadi aman dipanggil
 * dari webhook Midtrans maupun worker bot secara bersamaan.
 */

export type FulfillmentResult = {
	/** Jumlah akun yang belum bisa dialokasikan (stok/kapasitas habis). */
	missingAccounts: number;
	delivered: number;
	failedDeliveries: number;
};

function deliveryMessage(delivery: AccountDelivery): string {
	const lines = [
		'✅ <b>Pembayaran diterima!</b>',
		'',
		`Pesanan: <code>${escapeHtml(delivery.order_number)}</code>`,
		`Produk: ${escapeHtml(delivery.product_name)}`,
		'',
		'🔐 <b>Detail akun Anda</b>'
	];

	if (delivery.login_email) {
		lines.push(`Email/Username: <code>${escapeHtml(delivery.login_email)}</code>`);
	}

	if (delivery.login_password) {
		lines.push(`Password: <code>${escapeHtml(delivery.login_password)}</code>`);
	}

	if (delivery.notes?.trim()) {
		lines.push('', `📝 ${escapeHtml(delivery.notes.trim())}`);
	}

	lines.push(
		'',
		'⚠️ Akun ini digunakan bersama (sharing). Jangan mengubah email atau password agar tidak mengganggu pengguna lain.'
	);

	return lines.join('\n');
}

async function assignAccounts(supabase: ServiceClient, orderId: string): Promise<number> {
	const { data, error } = await supabase.rpc('assign_accounts_for_order', {
		p_order_id: orderId
	});

	if (error) {
		throw new Error(`Gagal mengalokasikan akun untuk order ${orderId}: ${error.message}`);
	}

	return Number(data ?? 0);
}

async function loadPendingDeliveries(
	supabase: ServiceClient,
	orderId: string | null
): Promise<AccountDelivery[]> {
	const { data, error } = await supabase.rpc('pending_account_deliveries', {
		p_order_id: orderId
	});

	if (error) {
		throw new Error(`Gagal memuat kiriman akun: ${error.message}`);
	}

	return (data ?? []) as AccountDelivery[];
}

/**
 * Klaim dulu (delivered_at), baru kirim. Jika dua proses berebut,
 * hanya satu yang berhasil klaim sehingga kredensial tidak terkirim ganda.
 * Bila pengiriman gagal, klaim dilepas agar dicoba lagi oleh worker.
 */
async function deliver(
	supabase: ServiceClient,
	send: SendMessage,
	delivery: AccountDelivery
): Promise<boolean> {
	const { data: claimed, error: claimError } = await supabase
		.from('account_assignments')
		.update({ delivered_at: new Date().toISOString() })
		.eq('id', delivery.assignment_id)
		.is('delivered_at', null)
		.select('id')
		.maybeSingle();

	if (claimError) {
		console.error(`Gagal klaim pengiriman ${delivery.assignment_id}:`, claimError.message);
		return false;
	}

	if (!claimed) return false; // sudah diklaim proses lain

	try {
		await send(delivery.chat_id, deliveryMessage(delivery), { parseMode: 'HTML' });
		return true;
	} catch (error) {
		console.error(`Gagal mengirim akun order ${delivery.order_number}:`, error);

		await supabase
			.from('account_assignments')
			.update({ delivered_at: null })
			.eq('id', delivery.assignment_id);

		return false;
	}
}

/** Alokasikan akun + kirim ke pelanggan untuk satu order yang sudah paid. */
export async function fulfillOrder(
	supabase: ServiceClient,
	send: SendMessage,
	orderId: string
): Promise<FulfillmentResult> {
	const missingAccounts = await assignAccounts(supabase, orderId);
	const deliveries = await loadPendingDeliveries(supabase, orderId);

	let delivered = 0;
	let failedDeliveries = 0;

	for (const delivery of deliveries) {
		if (await deliver(supabase, send, delivery)) delivered += 1;
		else failedDeliveries += 1;
	}

	return { missingAccounts, delivered, failedDeliveries };
}

/**
 * Jaring pengaman: order paid yang belum lengkap alokasinya
 * (mis. stok habis saat bayar) atau kiriman yang gagal.
 */
export async function retryPendingFulfillments(
	supabase: ServiceClient,
	send: SendMessage
): Promise<void> {
	const { data: unfulfilled, error } = await supabase
		.from('orders')
		.select('id')
		.eq('status', 'paid')
		.eq('source', 'telegram')
		.is('fulfilled_at', null)
		.limit(50);

	if (error) {
		throw new Error(`Gagal memuat order yang belum terpenuhi: ${error.message}`);
	}

	for (const order of unfulfilled ?? []) {
		try {
			await assignAccounts(supabase, order.id as string);
		} catch (assignError) {
			console.error(assignError);
		}
	}

	for (const delivery of await loadPendingDeliveries(supabase, null)) {
		await deliver(supabase, send, delivery);
	}
}
