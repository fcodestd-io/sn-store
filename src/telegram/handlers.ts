import { Markup, type Context } from 'telegraf';
import { escapeHtml, formatRupiah } from '../lib/server/format.ts';
import {
	buildCatalog,
	getActiveProduct,
	getAvailability,
	productCaption,
	productKeyboard
} from './catalog.ts';
import { CheckoutError, checkPayment, createInvoice } from './checkout.ts';
import { parseCommandName, respondToCommand } from './commands.ts';
import { bot } from './context.ts';

const PRODUCT_ID_PATTERN = '([0-9a-zA-Z-]{1,40})';

/** Mencegah dobel-tap "Beli" membuat dua invoice sekaligus untuk chat yang sama. */
const checkoutInProgress = new Set<number>();

/**
 * Menjawab callback query. Gagal bila query sudah kedaluwarsa (mis. tombol
 * ditekan saat bot offline); itu tidak boleh menghentikan handler.
 */
async function ack(ctx: Context, text?: string): Promise<void> {
	try {
		await ctx.answerCbQuery(text);
	} catch (error) {
		console.warn('answerCbQuery diabaikan:', (error as Error).message);
	}
}

async function safe(ctx: Context, action: () => Promise<void>): Promise<void> {
	try {
		await action();
	} catch (error) {
		console.error('Handler gagal:', error);
		await ctx.reply('Terjadi kesalahan. Silakan coba lagi beberapa saat lagi.').catch(() => {});
	}
}

async function showCatalog(ctx: Context): Promise<void> {
	const catalog = await buildCatalog();

	await ctx.reply(`🛍️ <b>Katalog Produk SN Store</b>\n\n${catalog.text}`, {
		parse_mode: 'HTML',
		...(catalog.keyboard ? { reply_markup: catalog.keyboard } : {})
	});
}

async function showProduct(ctx: Context, productId: string): Promise<void> {
	const product = await getActiveProduct(productId);

	if (!product) {
		await ctx.reply(
			'Produk ini sudah tidak tersedia. Ketik /produk untuk melihat katalog terbaru.'
		);
		return;
	}

	const availability = (await getAvailability([product.id])).get(product.id);
	const caption = productCaption(product, availability);
	const reply_markup = productKeyboard(product, availability);
	const imageUrl = product.image_url?.trim();

	if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
		try {
			await ctx.replyWithPhoto(imageUrl, { caption, parse_mode: 'HTML', reply_markup });
			return;
		} catch (error) {
			// URL gambar rusak/tidak bisa diunduh Telegram: tampilkan teks saja.
			console.warn(`Gambar produk ${product.id} gagal dikirim:`, error);
		}
	}

	await ctx.reply(caption, { parse_mode: 'HTML', reply_markup });
}

async function startCheckout(ctx: Context, productId: string): Promise<void> {
	const user = ctx.from;
	const chatId = ctx.chat?.id;

	if (!user || !chatId) return;

	if (checkoutInProgress.has(chatId)) {
		await ctx.reply('Invoice sedang dibuat, mohon tunggu sebentar.');
		return;
	}

	checkoutInProgress.add(chatId);

	try {
		const product = await getActiveProduct(productId);

		if (!product) {
			await ctx.reply(
				'Produk ini sudah tidak tersedia. Ketik /produk untuk melihat katalog terbaru.'
			);
			return;
		}

		const invoice = await createInvoice(user, product);

		await ctx.reply(
			[
				'🧾 <b>Invoice tersimpan</b>',
				'',
				`Nomor: <code>${escapeHtml(invoice.orderNumber)}</code>`,
				`Produk: ${escapeHtml(invoice.productName)}`,
				`Total: <b>${formatRupiah(invoice.total)}</b>`,
				'',
				'Ketuk <b>Bayar</b> untuk memilih metode pembayaran.',
				'Akun dikirim otomatis di chat ini setelah pembayaran berhasil.',
				'Sudah membayar tetapi akun belum masuk? Ketuk <b>Cek Status Pembayaran</b>.'
			].join('\n'),
			{
				parse_mode: 'HTML',
				reply_markup: Markup.inlineKeyboard([
					[Markup.button.url('💳 Bayar', invoice.paymentUrl)],
					[Markup.button.callback('🔄 Cek Status Pembayaran', `check:${invoice.orderNumber}`)],
					[Markup.button.callback('🛍️ Lihat Produk Lain', 'catalog')]
				]).reply_markup
			}
		);
	} catch (error) {
		if (error instanceof CheckoutError) {
			await ctx.reply(error.userMessage);
			return;
		}

		throw error;
	} finally {
		checkoutInProgress.delete(chatId);
	}
}

async function reportPaymentCheck(ctx: Context, orderNumber: string): Promise<void> {
	const chatId = ctx.chat?.id;

	if (!chatId) return;

	const result = await checkPayment(chatId, orderNumber);

	const messages: Record<typeof result, string | null> = {
		paid: null, // akun dikirim langsung oleh proses fulfillment
		waiting:
			'⏳ Pembayaran belum terdeteksi. Selesaikan pembayaran di halaman Snap, lalu ketuk Cek Status Pembayaran lagi.',
		closed: 'Invoice ini sudah kedaluwarsa atau dibatalkan. Buat invoice baru lewat /produk.',
		not_found: 'Invoice tidak ditemukan.'
	};

	const message = messages[result];

	if (message) await ctx.reply(message);
}

export function registerHandlers(): void {
	// Seluruh command ("/start", "/produk", "/apapun") dilayani dari database.
	bot.on('text', async (ctx) => {
		const command = parseCommandName(ctx.message.text.trim());

		if (!command) return;

		await safe(ctx, () =>
			respondToCommand(
				command,
				(html, replyMarkup) =>
					ctx.reply(html, {
						parse_mode: 'HTML',
						...(replyMarkup ? { reply_markup: replyMarkup } : {})
					}),
				ctx.from.first_name || 'Kak'
			)
		);
	});

	bot.action('catalog', async (ctx) => {
		await ack(ctx);
		await safe(ctx, () => showCatalog(ctx));
	});

	bot.action(new RegExp(`^p:${PRODUCT_ID_PATTERN}$`), async (ctx) => {
		await ack(ctx);
		await safe(ctx, () => showProduct(ctx, ctx.match[1]));
	});

	bot.action(new RegExp(`^buy:${PRODUCT_ID_PATTERN}$`), async (ctx) => {
		await ack(ctx, 'Membuat invoice…');
		await safe(ctx, () => startCheckout(ctx, ctx.match[1]));
	});

	bot.action(/^check:(SN-\d{10,16}-[0-9A-F]{8})$/, async (ctx) => {
		await ack(ctx, 'Memeriksa pembayaran…');
		await safe(ctx, () => reportPaymentCheck(ctx, ctx.match[1]));
	});

	bot.catch((error) => {
		console.error('Telegram bot error:', error);
	});
}
