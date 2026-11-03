import { timingSafeEqual } from 'node:crypto';
import { json } from '@sveltejs/kit';
import { CRON_SECRET } from '$app/env/private';
import type { RequestHandler } from './$types';

function authorized(header: string | null): boolean {
	if (!CRON_SECRET || !header) return false;

	const expected = Buffer.from(`Bearer ${CRON_SECRET}`);
	const actual = Buffer.from(header);

	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Dijalankan Vercel Cron (lihat vercel.json): sinkron status pembayaran pending,
 * ulang pengiriman akun yang tertunda, dan sinkron menu command Telegram.
 */
export const GET: RequestHandler = async ({ request }) => {
	if (!authorized(request.headers.get('authorization'))) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	const { runScheduledJobs } = await import('#telegram/jobs.ts');

	// Di production Vercel, cron sekaligus memastikan webhook Telegram tetap terdaftar.
	const webhookHost =
		process.env.VERCEL_ENV === 'production' ? process.env.VERCEL_PROJECT_PRODUCTION_URL : undefined;

	return json({ jobs: await runScheduledJobs(webhookHost) });
};
