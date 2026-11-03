/**
 * Pengirim pesan Telegram ringan lewat Bot API (fetch).
 * Dipakai webhook SvelteKit yang tidak menjalankan instance Telegraf.
 */

export type SendMessage = (
	chatId: string | number,
	text: string,
	options?: { parseMode?: 'HTML' }
) => Promise<void>;

export function createTelegramSender(botToken: string): SendMessage {
	return async (chatId, text, options) => {
		const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text,
				parse_mode: options?.parseMode,
				disable_web_page_preview: true
			})
		});

		if (!response.ok) {
			const detail = await response.text().catch(() => '');
			// Token tidak ikut dicatat; hanya status & respons Telegram.
			throw new Error(`Telegram sendMessage gagal (${response.status}): ${detail.slice(0, 200)}`);
		}
	};
}
