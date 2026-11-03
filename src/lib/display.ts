/** Helper tampilan yang aman dipakai di server maupun browser. */

const rupiah = new Intl.NumberFormat('id-ID', {
	style: 'currency',
	currency: 'IDR',
	maximumFractionDigits: 0
});

const dateTime = new Intl.DateTimeFormat('id-ID', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Asia/Jakarta'
});

export function formatRupiah(value: number | string | null | undefined): string {
	const amount = Number(value);

	return Number.isFinite(amount) ? rupiah.format(amount) : 'Harga tidak tersedia';
}

export function formatDateTime(value: string | null | undefined): string {
	if (!value) return '—';

	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? '—' : `${dateTime.format(date)} WIB`;
}

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

const STATUS_META: Record<string, { label: string; tone: StatusTone }> = {
	paid: { label: 'Lunas', tone: 'success' },
	completed: { label: 'Selesai', tone: 'success' },
	pending: { label: 'Menunggu', tone: 'warning' },
	failed: { label: 'Gagal', tone: 'danger' },
	cancelled: { label: 'Dibatalkan', tone: 'danger' },
	expired: { label: 'Kedaluwarsa', tone: 'neutral' },
	refunded: { label: 'Dikembalikan', tone: 'neutral' }
};

export function statusMeta(status: string | null | undefined): { label: string; tone: StatusTone } {
	return STATUS_META[status ?? ''] ?? { label: status || '—', tone: 'neutral' };
}

export const ORDER_STATUSES = ['pending', 'paid', 'cancelled', 'expired', 'refunded'] as const;
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'expired', 'refunded'] as const;

export function paymentMethodLabel(method: string | null | undefined): string {
	const labels: Record<string, string> = {
		snap: 'Midtrans Snap',
		qris: 'QRIS',
		gopay: 'GoPay',
		shopeepay: 'ShopeePay',
		bank_transfer: 'Virtual Account',
		credit_card: 'Kartu Kredit',
		cstore: 'Minimarket',
		echannel: 'Mandiri Bill'
	};

	return labels[method ?? ''] ?? (method || '—');
}
