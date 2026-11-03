import { getBot } from './app.ts';
import { startCommandMenuSync } from './commands.ts';
import { startDeliveryWorker } from './delivery-worker.ts';

/**
 * Entry point bot Telegram. Jalankan dengan: pnpm bot:dev
 */

const RETRY_MIN_MS = 5_000;
const RETRY_MAX_MS = 60_000;

function isFatal(error: unknown): boolean {
	// 401 = token salah, 409 = ada instance bot lain yang sedang polling.
	const code = (error as { response?: { error_code?: number } })?.response?.error_code;

	return code === 401 || code === 409;
}

async function launchWithRetry(): Promise<void> {
	let delay = RETRY_MIN_MS;

	for (;;) {
		try {
			// Di Telegraf 4 promise launch() baru selesai saat bot berhenti,
			// jadi status "berjalan" dilaporkan lewat callback.
			await bot.launch({ allowedUpdates: ['message', 'callback_query'] }, () => {
				console.log('SN Store Telegram bot berjalan.');
				startCommandMenuSync();
				startDeliveryWorker();
			});

			return;
		} catch (error) {
			if (isFatal(error)) {
				console.error('Bot tidak dapat dijalankan:', error);
				process.exit(1);
			}

			console.error(
				`Gagal terhubung ke Telegram, mencoba lagi dalam ${delay / 1000} detik:`,
				error
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
			delay = Math.min(delay * 2, RETRY_MAX_MS);
		}
	}
}

const bot = getBot();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

void launchWithRetry();
