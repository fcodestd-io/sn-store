import { fulfillOrder } from './fulfillment.ts';
import { mapMidtransStatus, type MidtransNotification } from './midtrans-status.ts';
import type { ServiceClient } from './supabase.ts';
import type { SendMessage } from './telegram-api.ts';

export type PaymentUpdateResult = {
	status: number;
	body: Record<string, unknown>;
};

function amountMatches(grossAmount: string, expectedAmount: number): boolean {
	const actual = Number(grossAmount);

	return Number.isFinite(actual) && Math.round(actual * 100) === Math.round(expectedAmount * 100);
}

function toIsoJakarta(settlementTime: string | undefined): string {
	// Midtrans mengirim waktu WIB tanpa zona: "2026-10-27 10:15:00".
	if (!settlementTime) return new Date().toISOString();

	const parsed = new Date(`${settlementTime.replace(' ', 'T')}+07:00`);

	return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

/**
 * Menerapkan status transaksi Midtrans ke order & payment, lalu memenuhi order
 * (alokasi + kirim akun) bila sudah lunas. Dipakai oleh webhook DAN oleh
 * sinkronisasi status di bot, sehingga hasilnya selalu sama dan idempoten.
 *
 * `notification` harus sudah dipercaya: signature webhook sudah diverifikasi,
 * atau datanya diambil langsung dari API Midtrans memakai server key.
 */
export async function applyPaymentNotification(
	supabase: ServiceClient,
	send: SendMessage,
	notification: MidtransNotification
): Promise<PaymentUpdateResult> {
	const orderNumber = notification.order_id;
	const transactionStatus = notification.transaction_status;

	if (!orderNumber || !transactionStatus) {
		return { status: 400, body: { message: 'Data order atau status transaksi tidak lengkap.' } };
	}

	const { data: order, error: orderError } = await supabase
		.from('orders')
		.select('id, total_amount, status')
		.eq('order_number', orderNumber)
		.maybeSingle();

	if (orderError) {
		console.error('Gagal mencari order:', orderError.message);
		return { status: 500, body: { message: 'Gagal mencari order.' } };
	}

	if (!order) {
		console.warn(`Order ${orderNumber} tidak ditemukan.`);
		return { status: 404, body: { message: 'Order tidak ditemukan.' } };
	}

	if (!amountMatches(notification.gross_amount ?? '', Number(order.total_amount))) {
		console.warn(`Jumlah pembayaran tidak cocok untuk order ${orderNumber}.`);
		return { status: 400, body: { message: 'Jumlah pembayaran tidak cocok.' } };
	}

	const { data: payment, error: paymentError } = await supabase
		.from('payments')
		.select('id')
		.eq('order_id', order.id)
		.eq('provider', 'midtrans')
		.maybeSingle();

	if (paymentError) {
		console.error('Gagal mencari payment:', paymentError.message);
		return { status: 500, body: { message: 'Gagal mencari payment.' } };
	}

	if (!payment) {
		return { status: 404, body: { message: 'Payment Midtrans untuk order ini tidak ditemukan.' } };
	}

	// Status paid final: notifikasi susulan tidak boleh menurunkannya,
	// tetapi pemenuhan tetap dicoba ulang (idempoten) bila sebelumnya gagal.
	if (order.status !== 'paid') {
		const mapped = mapMidtransStatus(transactionStatus, notification.fraud_status);
		const paidAt = mapped.payment === 'paid' ? toIsoJakarta(notification.settlement_time) : null;

		const { error: updatePaymentError } = await supabase
			.from('payments')
			.update({
				status: mapped.payment,
				payment_method: notification.payment_type ?? undefined,
				paid_at: paidAt
			})
			.eq('id', payment.id);

		if (updatePaymentError) {
			console.error('Gagal memperbarui status payment:', updatePaymentError.message);
			return { status: 500, body: { message: 'Gagal memperbarui payment.' } };
		}

		const { error: updateOrderError } = await supabase
			.from('orders')
			.update({ status: mapped.order, ...(paidAt ? { paid_at: paidAt } : {}) })
			.eq('id', order.id);

		if (updateOrderError) {
			console.error('Gagal memperbarui status order:', updateOrderError.message);
			return { status: 500, body: { message: 'Gagal memperbarui order.' } };
		}

		if (mapped.order !== 'paid') {
			return { status: 200, body: { received: true } };
		}
	}

	// Akun dikirim HANYA setelah order berstatus paid.
	try {
		const result = await fulfillOrder(supabase, send, order.id as string);

		if (result.missingAccounts > 0) {
			console.warn(
				`Order ${orderNumber}: ${result.missingAccounts} akun belum tersedia, akan dicoba ulang.`
			);
		}
	} catch (error) {
		console.error(`Pemenuhan order ${orderNumber} gagal:`, error);
		return { status: 500, body: { message: 'Pemenuhan order gagal.' } };
	}

	return { status: 200, body: { received: true } };
}
