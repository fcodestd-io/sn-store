import { Telegraf } from 'telegraf';
import { createSnapClient } from '../lib/server/midtrans.ts';
import { createServiceClient } from '../lib/server/supabase.ts';
import type { SendMessage } from '../lib/server/telegram-api.ts';
import { config } from './config.ts';

/** Dependensi bersama seluruh handler bot. */
export const bot = new Telegraf(config.botToken);
export const supabase = createServiceClient(config.supabaseUrl, config.supabaseServiceRoleKey);
export const snap = createSnapClient(config.midtrans);

/** Pengirim pesan lewat Telegraf, memakai koneksi yang sama dengan bot. */
export const sendMessage: SendMessage = async (chatId, text, options) => {
	await bot.telegram.sendMessage(chatId, text, {
		...(options?.parseMode ? { parse_mode: options.parseMode } : {}),
		link_preview_options: { is_disabled: true }
	});
};
