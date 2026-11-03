/**
 * Mendaftarkan webhook Telegram otomatis saat build di Vercel (production).
 * Dipanggil oleh script `vercel-build` di package.json, jadi setiap deploy
 * production langsung membuat bot aktif tanpa menjalankan `pnpm bot:dev`.
 *
 * Tidak pernah menggagalkan build: kalau gagal, hanya mencetak peringatan.
 * Pendaftaran manual tetap bisa lewat `pnpm bot:webhook <https://domain>`.
 */

const { VERCEL_ENV, VERCEL_PROJECT_PRODUCTION_URL } = process.env;
const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

function skip(reason) {
	console.warn(`[webhook] dilewati: ${reason}`);
	process.exit(0);
}

if (VERCEL_ENV !== 'production') skip('bukan build production Vercel.');
if (!VERCEL_PROJECT_PRODUCTION_URL) skip('VERCEL_PROJECT_PRODUCTION_URL tidak tersedia.');
if (!token) skip('TELEGRAM_BOT_TOKEN belum diatur di Vercel (Production).');
if (!secret || secret.length < 16 || !/^[A-Za-z0-9_-]+$/.test(secret)) {
	skip('TELEGRAM_WEBHOOK_SECRET belum diatur / tidak valid (16-64 karakter: huruf, angka, _ atau -).');
}

const url = `https://${VERCEL_PROJECT_PRODUCTION_URL}/api/telegram/webhook`;

try {
	const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			url,
			secret_token: secret,
			allowed_updates: ['message', 'callback_query'],
			drop_pending_updates: false
		})
	});
	const result = await response.json();

	if (!result.ok) throw new Error(result.description ?? 'setWebhook gagal');

	console.log(`[webhook] terdaftar: ${url}`);
} catch (error) {
	console.warn('[webhook] gagal mendaftar (build tetap lanjut):', error);
}
