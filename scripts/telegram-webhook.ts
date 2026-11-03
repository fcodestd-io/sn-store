/**
 * Mendaftarkan / menghapus webhook Telegram.
 *
 *   pnpm bot:webhook https://nama-app.vercel.app   -> daftarkan webhook
 *   pnpm bot:webhook --delete                      -> hapus (kembali ke polling lokal)
 *   pnpm bot:webhook --info                        -> lihat status webhook
 *
 * Catatan: webhook dan polling tidak bisa aktif bersamaan. Menjalankan
 * `pnpm bot:dev` otomatis menghapus webhook; daftarkan ulang setelah selesai.
 */

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const arg = process.argv[2];

if (!token) {
	console.error('TELEGRAM_BOT_TOKEN belum diatur di .env');
	process.exit(1);
}

async function call(method: string, body?: Record<string, unknown>): Promise<unknown> {
	const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body ?? {})
	});
	const result = (await response.json()) as { ok: boolean; description?: string; result?: unknown };

	if (!result.ok) throw new Error(result.description ?? `Telegram ${method} gagal`);

	return result.result;
}

if (arg === '--delete') {
	await call('deleteWebhook', { drop_pending_updates: false });
	console.log('Webhook dihapus. Bot dapat dijalankan dengan pnpm bot:dev.');
} else if (arg === '--info') {
	const info = (await call('getWebhookInfo')) as Record<string, unknown>;

	console.log(
		JSON.stringify(
			{
				url: info.url,
				pending_update_count: info.pending_update_count,
				last_error_date: info.last_error_date,
				last_error_message: info.last_error_message
			},
			null,
			2
		)
	);
} else if (arg?.startsWith('https://')) {
	if (!secret || secret.length < 16) {
		console.error('Isi TELEGRAM_WEBHOOK_SECRET (minimal 16 karakter, huruf/angka/_/-) di .env');
		process.exit(1);
	}

	const url = `${arg.replace(/\/+$/, '')}/api/telegram/webhook`;

	await call('setWebhook', {
		url,
		secret_token: secret,
		allowed_updates: ['message', 'callback_query'],
		drop_pending_updates: false
	});
	console.log(`Webhook terdaftar: ${url}`);
} else {
	console.error('Pemakaian: pnpm bot:webhook <https://domain> | --delete | --info');
	process.exit(1);
}
