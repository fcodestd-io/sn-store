import type { MidtransNotification } from './midtrans-status.ts';
import type { ServiceClient } from './supabase.ts';
import type { SendMessage } from './telegram-api.ts';
import { applyPaymentNotification } from './payment-sync.ts';

export type MidtransApiConfig = {
	serverKey: string;
	isProduction: boolean;
};

/**
 * Menanyakan status transaksi langsung ke Midtrans (dipercaya karena memakai
 * server key lewat HTTPS). Mengembalikan null bila transaksi belum ada,
 * misalnya pelanggan belum membuka halaman Snap.
 */
export async function fetchTransactionStatus(
	config: MidtransApiConfig,
	orderNumber: string
): Promise<MidtransNotification | null> {
	const base = config.isProduction
		? 'https://api.midtrans.com'
		: 'https://api.sandbox.midtrans.com';
	const auth = Buffer.from(`${config.serverKey}:`).toString('base64');

	const response = await fetch(`${base}/v2/${encodeURIComponent(orderNumber)}/status`, {
		headers: { accept: 'application/json', authorization: `Basic ${auth}` }
	});

	if (response.status === 404) return null;

	if (!response.ok) {
		throw new Error(`Midtrans status API gagal (${response.status}) untuk ${orderNumber}`);
	}

	const body = (await response.json()) as MidtransNotification;

	// Midtrans kadang membalas HTTP 200 dengan status_code "404" di body.
	if (body.status_code === '404' || !body.transaction_status) return null;

	return body;
}

/**
 * Mensinkronkan order Telegram yang masih pending (maks. 24 jam, sesuai masa
 * berlaku Snap). Berguna saat webhook tidak terjangkau, misalnya di localhost.
 */
export async function syncPendingPayments(
	supabase: ServiceClient,
	send: SendMessage,
	config: MidtransApiConfig
): Promise<void> {
	const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

	const { data: pending, error } = await supabase
		.from('orders')
		.select('order_number')
		.eq('status', 'pending')
		.eq('source', 'telegram')
		.gte('created_at', since)
		.order('created_at', { ascending: false })
		.limit(20);

	if (error) {
		throw new Error(`Gagal memuat order pending: ${error.message}`);
	}

	for (const order of pending ?? []) {
		try {
			const status = await fetchTransactionStatus(config, order.order_number as string);

			if (status) await applyPaymentNotification(supabase, send, status);
		} catch (syncError) {
			console.error(`Sinkron status ${order.order_number} gagal:`, syncError);
		}
	}
}
