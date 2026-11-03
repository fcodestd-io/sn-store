import { retryPendingFulfillments } from '../lib/server/fulfillment.ts';
import { syncPendingPayments } from '../lib/server/midtrans-api.ts';
import { config } from './config.ts';
import { sendMessage, supabase } from './context.ts';

function startLoop(name: string, intervalMs: number, task: () => Promise<void>): void {
	let running = false;

	const run = async () => {
		if (running) return;

		running = true;

		try {
			await task();
		} catch (error) {
			console.error(`Worker ${name} gagal:`, error);
		} finally {
			running = false;
		}
	};

	void run();
	setInterval(() => void run(), intervalMs).unref();
}

/**
 * Dua jaring pengaman untuk pembayaran:
 * 1. payment-sync: menanyakan status invoice pending langsung ke Midtrans, jadi
 *    akun tetap terkirim walau webhook tidak terjangkau (mis. di localhost).
 * 2. fulfillment: mengulang alokasi/pengiriman akun yang tertunda (Telegram
 *    sempat error, atau stok habis lalu admin menambah akun).
 */
export function startDeliveryWorker(): void {
	startLoop('payment-sync', config.paymentSyncIntervalMs, () =>
		syncPendingPayments(supabase, sendMessage, config.midtrans)
	);
	startLoop('pengiriman akun', config.deliveryRetryIntervalMs, () =>
		retryPendingFulfillments(supabase, sendMessage)
	);
}
