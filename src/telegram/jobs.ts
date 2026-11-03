import { retryPendingFulfillments } from '../lib/server/fulfillment.ts';
import { syncPendingPayments } from '../lib/server/midtrans-api.ts';
import { syncCommandMenu } from './commands.ts';
import { config } from './config.ts';
import { sendMessage, supabase } from './context.ts';
import { ensureWebhook } from './webhook.ts';

/**
 * Pekerjaan berkala sebagai satu putaran (untuk Vercel Cron, yang tidak punya
 * proses berjalan terus-menerus seperti polling lokal).
 */
export async function runScheduledJobs(webhookHost?: string): Promise<Record<string, 'ok' | string>> {
	const results: Record<string, 'ok' | string> = {};

	const jobs: Array<[string, () => Promise<void>]> = [
		['payment-sync', () => syncPendingPayments(supabase, sendMessage, config.midtrans)],
		['pengiriman-akun', () => retryPendingFulfillments(supabase, sendMessage)],
		['menu-command', () => syncCommandMenu()]
	];

	// Jaring pengaman: daftarkan ulang webhook bila terhapus (hanya di production Vercel).
	if (webhookHost) {
		jobs.push([
			'webhook-telegram',
			async () => {
				await ensureWebhook(webhookHost);
			}
		]);
	}

	for (const [name, job] of jobs) {
		try {
			await job();
			results[name] = 'ok';
		} catch (error) {
			console.error(`Job ${name} gagal:`, error);
			results[name] = error instanceof Error ? error.message : 'gagal';
		}
	}

	return results;
}
