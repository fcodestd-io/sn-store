import { randomBytes } from 'node:crypto';

export { formatRupiah } from '../display.ts';

/** Escape untuk parse_mode HTML Telegram. */
export function escapeHtml(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/** Potong teks tanpa memutus di tengah karakter; tambahkan elipsis bila terpotong. */
export function truncate(value: string, max: number): string {
	const chars = Array.from(value);

	return chars.length <= max
		? value
		: `${chars
				.slice(0, max - 1)
				.join('')
				.trimEnd()}…`;
}

export function createOrderNumber(): string {
	return `SN-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

/** Harga harus bilangan bulat positif (Rupiah tanpa desimal untuk Midtrans). */
export function parsePrice(value: number | string, label: string): number {
	const price = Number(value);

	if (!Number.isSafeInteger(price) || price <= 0) {
		throw new Error(`Harga produk "${label}" tidak valid.`);
	}

	return price;
}
