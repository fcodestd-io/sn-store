import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true
	},

	MIDTRANS_CLIENT_KEY: {
		public: true
	},

	TELEGRAM_BOT_TOKEN: {},
	SUPABASE_SERVICE_ROLE_KEY: {},
	MIDTRANS_SERVER_KEY: {},
	MIDTRANS_IS_PRODUCTION: {},

	/** Rahasia header webhook Telegram (wajib di Vercel). Opsional saat memakai polling lokal. */
	TELEGRAM_WEBHOOK_SECRET: {
		schema: (value) => value?.trim() || undefined
	},
	/** Rahasia Vercel Cron; Vercel mengirimnya sebagai "Authorization: Bearer ...". */
	CRON_SECRET: {
		schema: (value) => value?.trim() || undefined
	}
});
