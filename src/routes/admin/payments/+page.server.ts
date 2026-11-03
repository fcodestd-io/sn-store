import { PAYMENT_STATUSES } from '#lib/display.ts';
import {
	PAGE_SIZE,
	pageRange,
	parsePage,
	pickStatus,
	sanitizeSearch
} from '#lib/server/admin-query.ts';
import type { PageServerLoad } from './$types';

type SalesSummary = {
	total_payments: number;
	paid_payments: number;
	pending_payments: number;
	failed_payments: number;
	received_amount: number | string;
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const status = pickStatus(url.searchParams.get('status'), PAYMENT_STATUSES);
	const q = sanitizeSearch(url.searchParams.get('q'));
	const page = parsePage(url);
	const { from, to } = pageRange(page);

	let query = locals.supabase
		.from('payments')
		.select(
			'id, order_id, provider, external_id, payment_method, amount, status, paid_at, expires_at, created_at',
			{ count: 'exact' }
		)
		.order('created_at', { ascending: false })
		.range(from, to);

	if (status) query = query.eq('status', status);
	if (q) query = query.or(`external_id.ilike.%${q}%,payment_method.ilike.%${q}%`);

	const [list, summary] = await Promise.all([query, locals.supabase.rpc('admin_sales_summary')]);

	if (list.error) {
		console.error('Failed to load payments:', list.error.message);
	}

	const payments = list.error ? [] : (list.data ?? []);
	const orderIds = [...new Set(payments.map((payment) => payment.order_id as string))];

	// Nama pelanggan hanya pelengkap tampilan; gagal tidak menggagalkan halaman.
	const orders = orderIds.length
		? await locals.supabase
				.from('orders')
				.select('id, order_number, customer_name')
				.in('id', orderIds)
		: { data: [], error: null };

	const orderById = new Map((orders.data ?? []).map((order) => [order.id as string, order]));

	return {
		payments: payments.map((payment) => ({
			...payment,
			order: orderById.get(payment.order_id as string) ?? null
		})),
		total: list.count ?? 0,
		page,
		pageSize: PAGE_SIZE,
		status,
		q,
		summary: summary.error ? null : ((summary.data?.[0] ?? null) as SalesSummary | null),
		loadError: list.error
			? 'Data pembayaran gagal dimuat. Pastikan migrasi 20261028000000_admin_orders_payments.sql sudah dijalankan.'
			: null
	};
};
