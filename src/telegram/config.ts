function requiredEnv(key: string): string {
	const value = process.env[key]?.trim();

	if (!value) {
		throw new Error(`Environment variable ${key} belum diatur (cek file .env).`);
	}

	return value;
}

export const config = {
	botToken: requiredEnv('TELEGRAM_BOT_TOKEN'),
	supabaseUrl: requiredEnv('PUBLIC_SUPABASE_URL'),
	supabaseServiceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
	midtrans: {
		serverKey: requiredEnv('MIDTRANS_SERVER_KEY'),
		clientKey: requiredEnv('MIDTRANS_CLIENT_KEY'),
		isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true'
	},
	/** Interval (ms) worker yang mengulang alokasi/pengiriman akun yang tertunda. */
	deliveryRetryIntervalMs: 60_000,
	/** Interval (ms) menanyakan status pembayaran pending langsung ke Midtrans. */
	paymentSyncIntervalMs: 15_000,
	/** Interval (ms) sinkronisasi daftar command ke menu Telegram. */
	commandSyncIntervalMs: 60_000
} as const;
