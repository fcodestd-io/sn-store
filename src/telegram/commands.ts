import type { BotCommand } from '../lib/types/database.ts';
import { escapeHtml, truncate } from '../lib/server/format.ts';
import { buildCatalog, type ReplyMarkup } from './catalog.ts';
import { config } from './config.ts';
import { bot, supabase } from './context.ts';

/**
 * Command sepenuhnya berasal dari tabel `bot_commands` (dikelola admin).
 * Isi response mendukung placeholder:
 *   {{product_catalog}}  daftar produk + tombol pilih produk
 *   {{command_list}}     daftar command aktif
 *   {{name}}             nama depan pelanggan
 *
 * Hanya jika baris start/produk/bantuan BELUM ada di database, bot memakai
 * bawaan di bawah supaya bot tetap berguna di instalasi baru.
 */
const DEFAULT_RESPONSES: Record<string, string> = {
	start: '👋 Halo {{name}}, selamat datang di SN Store!\n\nKetuk /produk untuk melihat katalog.',
	produk: '🛍️ Katalog Produk SN Store\n\n{{product_catalog}}',
	bantuan: '📖 Bantuan SN Store\n\n{{command_list}}'
};

const COMMAND_PATTERN = /^[a-z0-9_]{1,32}$/;

async function listActiveCommands(): Promise<BotCommand[]> {
	const { data, error } = await supabase
		.from('bot_commands')
		.select('command, response, is_active')
		.eq('is_active', true)
		.order('command', { ascending: true });

	if (error) throw new Error(`Gagal membaca bot_commands: ${error.message}`);

	return (data ?? []) as BotCommand[];
}

async function findCommand(command: string): Promise<{ response: string } | 'disabled' | null> {
	const { data, error } = await supabase
		.from('bot_commands')
		.select('command, response, is_active')
		.eq('command', command)
		.maybeSingle();

	if (error) throw new Error(`Gagal membaca bot_commands: ${error.message}`);

	if (data) {
		return data.is_active && data.response ? { response: data.response as string } : 'disabled';
	}

	const fallback = DEFAULT_RESPONSES[command];

	return fallback ? { response: fallback } : null;
}

/** "/Produk@NamaBot arg" -> "produk" */
export function parseCommandName(text: string): string | null {
	if (!text.startsWith('/')) return null;

	const name = text.slice(1).split(/\s+/)[0]?.split('@')[0]?.toLowerCase() ?? '';

	return COMMAND_PATTERN.test(name) ? name : null;
}

async function renderResponse(
	template: string,
	context: { firstName: string }
): Promise<{ html: string; replyMarkup?: ReplyMarkup }> {
	let html = escapeHtml(template).replaceAll('{{name}}', escapeHtml(context.firstName));
	let replyMarkup: ReplyMarkup | null = null;

	if (html.includes('{{command_list}}')) {
		const commands = await listActiveCommands();
		const list = commands.length
			? commands.map((item) => `/${item.command}`).join('\n')
			: 'Belum ada command yang tersedia.';

		html = html.replaceAll('{{command_list}}', list);
	}

	if (html.includes('{{product_catalog}}')) {
		const catalog = await buildCatalog();

		html = html.replaceAll('{{product_catalog}}', catalog.text);
		replyMarkup = catalog.keyboard;
	}

	return { html: truncate(html, 4000), replyMarkup: replyMarkup ?? undefined };
}

export async function respondToCommand(
	command: string,
	reply: (html: string, replyMarkup?: ReplyMarkup) => Promise<unknown>,
	firstName: string
): Promise<void> {
	const found = await findCommand(command);

	if (found === null) {
		await reply('Command tidak dikenal. Ketik /bantuan untuk melihat daftar command.');
		return;
	}

	if (found === 'disabled') return; // dinonaktifkan admin

	const rendered = await renderResponse(found.response, { firstName });

	await reply(rendered.html, rendered.replyMarkup);
}

function menuDescription(command: BotCommand): string {
	const firstLine =
		command.response
			.replace(/\{\{[a-z_]+\}\}/g, '')
			.split('\n')
			.map((line) => line.trim())
			.find(Boolean) ?? command.command;

	return truncate(firstLine, 60);
}

let lastSyncedMenu = '';

/** Menyamakan menu "/" di Telegram dengan command aktif di database. */
export async function syncCommandMenu(): Promise<void> {
	const commands = (await listActiveCommands()).slice(0, 100);
	const known = new Set(commands.map((item) => item.command));

	for (const [command, response] of Object.entries(DEFAULT_RESPONSES)) {
		if (!known.has(command)) {
			// Tampilkan bawaan hanya bila admin belum pernah membuat barisnya.
			const { data } = await supabase
				.from('bot_commands')
				.select('id')
				.eq('command', command)
				.maybeSingle();

			if (!data) commands.push({ command, response, is_active: true });
		}
	}

	const menu = commands
		.filter((item) => COMMAND_PATTERN.test(item.command))
		.map((item) => ({ command: item.command, description: menuDescription(item) }));

	const signature = JSON.stringify(menu);

	if (signature === lastSyncedMenu) return;

	await bot.telegram.setMyCommands(menu);
	lastSyncedMenu = signature;
}

export function startCommandMenuSync(): void {
	const run = () =>
		syncCommandMenu().catch((error: unknown) => {
			console.error('Gagal sinkron menu command:', error);
		});

	void run();
	setInterval(run, config.commandSyncIntervalMs).unref();
}
