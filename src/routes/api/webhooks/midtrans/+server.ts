import { createHash, timingSafeEqual } from 'node:crypto';
import { json } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$app/env/public';
import {
	MIDTRANS_SERVER_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	TELEGRAM_BOT_TOKEN
} from '$app/env/private';
import type { MidtransNotification } from '#lib/server/midtrans-status.ts';
import { applyPaymentNotification } from '#lib/server/payment-sync.ts';
import { createServiceClient } from '#lib/server/supabase.ts';
import { createTelegramSender } from '#lib/server/telegram-api.ts';
import type { RequestHandler } from './$types';

function verifySignature(payload: MidtransNotification): boolean {
	if (
		!payload.order_id ||
		!payload.status_code ||
		!payload.gross_amount ||
		!payload.signature_key
	) {
		return false;
	}

	const expected = createHash('sha512')
		.update(
			`${payload.order_id}${payload.status_code}${payload.gross_amount}${MIDTRANS_SERVER_KEY}`
		)
		.digest();
	const received = Buffer.from(payload.signature_key, 'hex');

	return expected.length === received.length && timingSafeEqual(expected, received);
}

export const POST: RequestHandler = async ({ request }) => {
	let notification: MidtransNotification;

	try {
		notification = (await request.json()) as MidtransNotification;
	} catch {
		return json({ message: 'Body JSON tidak valid.' }, { status: 400 });
	}

	if (!verifySignature(notification)) {
		console.warn('Webhook Midtrans ditolak: signature tidak valid.');
		return json({ message: 'Signature tidak valid.' }, { status: 403 });
	}

	const supabase = createServiceClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
	const send = createTelegramSender(TELEGRAM_BOT_TOKEN);
	const result = await applyPaymentNotification(supabase, send, notification);

	return json(result.body, { status: result.status });
};
