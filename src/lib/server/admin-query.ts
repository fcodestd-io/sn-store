export const PAGE_SIZE = 20;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
	return UUID_PATTERN.test(value);
}

export function parsePage(url: URL): number {
	const page = Number(url.searchParams.get('page'));

	return Number.isSafeInteger(page) && page >= 1 ? Math.min(page, 10_000) : 1;
}

export function pageRange(page: number): { from: number; to: number } {
	const from = (page - 1) * PAGE_SIZE;

	return { from, to: from + PAGE_SIZE - 1 };
}

/**
 * Membersihkan kata kunci sebelum dipakai di filter `.or()` PostgREST.
 * Karakter pemisah/wildcard dibuang agar tidak mengubah struktur filter.
 */
export function sanitizeSearch(raw: string | null): string {
	return (raw ?? '')
		.replace(/[,()%*\\"'`:]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 60);
}

export function pickStatus(raw: string | null, allowed: readonly string[]): string | null {
	return raw && allowed.includes(raw) ? raw : null;
}
