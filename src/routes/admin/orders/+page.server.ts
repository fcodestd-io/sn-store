import { ORDER_STATUSES } from '#lib/display.ts';
import {
	PAGE_SIZE,
	pageRange,
	parsePage,
	pickStatus,
	sanitizeSearch
} from '#lib/server/admin-query.ts';
import type { PageServerLoad } from './$types';

type SalesSummary = {
	total_orders: number;
	paid_orders: number;
	pending_orders: number;
	closed_orders: number;
	revenue: number | string;
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const status = pickStatus(url.searchParams.get('status'), ORDER_STATUSES);
	const q = sanitizeSearch(url.searchParams.get('q'));
	const page = parsePage(url);
	const { from, to } = pageRange(page);

	let query = locals.supabase
		.from('orders')
		.select(
			'id, order_number, source, customer_name, status, total_amount, currency, created_at, paid_at, fulfilled_at',
			{ count: 'exact' }
		)
		.order('created_at', { ascending: false })
		.range(from, to);

	if (status) query = query.eq('status', status);
	if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%`);

	const [list, summary] = await Promise.all([query, locals.supabase.rpc('admin_sales_summary')]);

	if (list.error) {
		console.error('Failed to load orders:', list.error.message);
	}

	const orders = list.error ? [] : (list.data ?? []);
	const ids = orders.map((order) => order.id as string);

	// Produk & status pengiriman akun hanya pelengkap tampilan: gagal tidak menggagalkan halaman.
	const [items, assignments] = ids.length
		? await Promise.all([
				locals.supabase
					.from('order_items')
					.select('order_id, product_name, quantity')
					.in('order_id', ids),
				locals.supabase
					.from('account_assignments')
					.select('order_id, delivered_at')
					.in('order_id', ids)
			])
		: [
				{ data: [], error: null },
				{ data: [], error: null }
			];

	const productsByOrder = new Map<string, string[]>();

	for (const item of items.data ?? []) {
		const label = item.quantity > 1 ? `${item.product_name} ×${item.quantity}` : item.product_name;
		const names = productsByOrder.get(item.order_id as string) ?? [];

		names.push(label as string);
		productsByOrder.set(item.order_id as string, names);
	}

	const deliveryByOrder = new Map<string, { total: number; delivered: number }>();

	for (const row of assignments.data ?? []) {
		const entry = deliveryByOrder.get(row.order_id as string) ?? { total: 0, delivered: 0 };

		entry.total += 1;
		if (row.delivered_at) entry.delivered += 1;
		deliveryByOrder.set(row.order_id as string, entry);
	}

	return {
		orders: orders.map((order) => ({
			...order,
			products: productsByOrder.get(order.id as string) ?? [],
			delivery: assignments.error ? null : (deliveryByOrder.get(order.id as string) ?? null)
		})),
		total: list.count ?? 0,
		page,
		pageSize: PAGE_SIZE,
		status,
		q,
		summary: summary.error ? null : ((summary.data?.[0] ?? null) as SalesSummary | null),
		loadError: list.error
			? 'Riwayat order gagal dimuat. Pastikan migrasi 20261028000000_admin_orders_payments.sql sudah dijalankan.'
			: null
	};
};
