import { Markup } from 'telegraf';
import type { InlineKeyboardMarkup } from 'telegraf/types';
import { escapeHtml, formatRupiah, truncate } from '../lib/server/format.ts';
import type { AccountUsage, Product } from '../lib/types/database.ts';
import { supabase } from './context.ts';

const PRODUCT_COLUMNS = 'id, name, description, image_url, price, is_active';

/** Batas Telegram: pesan 4096 karakter, caption foto 1024 karakter. */
const MAX_CATALOG_ITEMS = 30;
const MAX_DESCRIPTION_CHARS = 600;

export type ReplyMarkup = InlineKeyboardMarkup;

export type Availability = {
	available: boolean;
	/** Sisa slot; null bila ada akun tanpa batas pengguna. */
	slots: number | null;
};

export async function getActiveProducts(): Promise<Product[]> {
	const { data, error } = await supabase
		.from('products')
		.select(PRODUCT_COLUMNS)
		.eq('is_active', true)
		.order('name', { ascending: true })
		.limit(MAX_CATALOG_ITEMS);

	if (error) throw new Error(`Gagal mengambil produk: ${error.message}`);

	return (data ?? []) as Product[];
}

export async function getActiveProduct(id: string): Promise<Product | null> {
	const { data, error } = await supabase
		.from('products')
		.select(PRODUCT_COLUMNS)
		.eq('id', id)
		.eq('is_active', true)
		.maybeSingle();

	if (error) throw new Error(`Gagal memeriksa produk: ${error.message}`);

	return (data as Product | null) ?? null;
}

/** Ketersediaan per produk dari akun berstatus "available" yang masih punya slot. */
export async function getAvailability(productIds: string[]): Promise<Map<string, Availability>> {
	const result = new Map<string, Availability>(
		productIds.map((id) => [id, { available: false, slots: 0 }])
	);

	if (productIds.length === 0) return result;

	const { data, error } = await supabase
		.from('product_account_usage')
		.select('product_id, max_users, used_count')
		.in('product_id', productIds)
		.eq('status', 'available');

	if (error) throw new Error(`Gagal memeriksa ketersediaan akun: ${error.message}`);

	for (const row of (data ?? []) as AccountUsage[]) {
		const current = result.get(row.product_id);

		if (!current) continue;

		if (row.max_users === null) {
			result.set(row.product_id, { available: true, slots: null });
			continue;
		}

		const free = row.max_users - row.used_count;

		if (free <= 0) continue;

		result.set(row.product_id, {
			available: true,
			slots: current.slots === null ? null : current.slots + free
		});
	}

	return result;
}

function availabilityLabel(availability: Availability | undefined): string {
	if (!availability?.available) return 'Habis';
	if (availability.slots === null) return 'Tersedia';

	return `Sisa ${availability.slots} slot`;
}

export async function buildCatalog(): Promise<{
	text: string;
	keyboard: ReplyMarkup | null;
}> {
	const products = await getActiveProducts();

	if (products.length === 0) {
		return { text: 'Belum ada produk yang tersedia saat ini.', keyboard: null };
	}

	const availability = await getAvailability(products.map((product) => product.id));

	const lines = products.map((product, index) => {
		const label = availabilityLabel(availability.get(product.id));

		return `<b>${index + 1}.</b> ${escapeHtml(product.name)}\n     ${formatRupiah(product.price)} · ${label}`;
	});

	const buttons = products.map((product, index) => [
		Markup.button.callback(truncate(`${index + 1}. ${product.name}`, 60), `p:${product.id}`)
	]);

	return {
		text: lines.join('\n'),
		keyboard: Markup.inlineKeyboard(buttons).reply_markup
	};
}

export function productCaption(product: Product, availability: Availability | undefined): string {
	const description = product.description?.trim() || 'Belum ada deskripsi untuk produk ini.';

	return [
		`🛍️ <b>${escapeHtml(truncate(product.name, 120))}</b>`,
		'',
		// Dipotong SEBELUM di-escape agar tag HTML tidak terputus di tengah.
		escapeHtml(truncate(description, MAX_DESCRIPTION_CHARS)),
		'',
		`💰 Harga: <b>${formatRupiah(product.price)}</b>`,
		`📦 Ketersediaan: <b>${availabilityLabel(availability)}</b>`
	].join('\n');
}

export function productKeyboard(product: Product, availability: Availability | undefined) {
	const rows = [];

	if (availability?.available) {
		rows.push([Markup.button.callback('🛒 Beli Sekarang', `buy:${product.id}`)]);
	}

	rows.push([Markup.button.callback('↩️ Kembali ke Katalog', 'catalog')]);

	return Markup.inlineKeyboard(rows).reply_markup;
}
