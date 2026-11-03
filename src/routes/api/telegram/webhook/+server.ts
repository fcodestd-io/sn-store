import { timingSafeEqual } from 'node:crypto';
import { json } from '@sveltejs/kit';
import { TELEGRAM_WEBHOOK_SECRET } from '$app/env/private';
import type { RequestHandler } from './$types';

function secretMatches(received: string | null): boolean {
	if (!TELEGRAM_WEBHOOK_SECRET || !received) return false;

	const expected = Buffer.from(TELEGRAM_WEBHOOK_SECRET);
	const actual = Buffer.from(received);

	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Penerima update Telegram untuk Vercel (pengganti long polling `pnpm bot:dev`).
 * Daftarkan sekali dengan: pnpm bot:webhook https://<domain>.vercel.app
 */
export const POST: RequestHandler = async ({ request }) => {
	if (!TELEGRAM_WEBHOOK_SECRET) {
		console.error('TELEGRAM_WEBHOOK_SECRET belum diatur.');
		return json({ message: 'Webhook belum dikonfigurasi.' }, { status: 500 });
	}

	if (!secretMatches(request.headers.get('x-telegram-bot-api-secret-token'))) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}

	let update: unknown;

	try {
		update = await request.json();
	} catch {
		return json({ message: 'Body JSON tidak valid.' }, { status: 400 });
	}

	try {
		// Dimuat saat dibutuhkan agar build tidak menjalankan konfigurasi bot.
		const { getBot } = await import('#telegram/app.ts');

		// Serverless harus menunggu handler selesai sebelum membalas.
		await getBot().handleUpdate(update as Parameters<ReturnType<typeof getBot>['handleUpdate']>[0]);
	} catch (error) {
		// Tetap balas 200 agar Telegram tidak mengulang update yang sama terus-menerus.
		console.error('Gagal memproses update Telegram:', error);
	}

	return json({ ok: true });
};
