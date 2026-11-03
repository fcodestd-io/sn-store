import { bot } from './context.ts';

/** URL endpoint webhook untuk sebuah domain, mis. "sn-store.vercel.app". */
export function webhookUrlFor(host: string): string {
	const origin = host.startsWith('http') ? host : `https://${host}`;

	return `${origin.replace(/\/+$/, '')}/api/telegram/webhook`;
}

/**
 * Memastikan webhook Telegram menunjuk ke domain ini. Dipakai cron sebagai
 * jaring pengaman bila webhook terhapus (mis. setelah `pnpm bot:dev` dijalankan).
 */
export async function ensureWebhook(host: string): Promise<'sudah-aktif' | 'didaftarkan'> {
	const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

	if (!secret || secret.length < 16) {
		throw new Error('TELEGRAM_WEBHOOK_SECRET belum diatur (minimal 16 karakter).');
	}

	const url = webhookUrlFor(host);
	const info = await bot.telegram.getWebhookInfo();

	if (info.url === url) return 'sudah-aktif';

	await bot.telegram.setWebhook(url, {
		secret_token: secret,
		allowed_updates: ['message', 'callback_query'],
		drop_pending_updates: false
	});

	return 'didaftarkan';
}
