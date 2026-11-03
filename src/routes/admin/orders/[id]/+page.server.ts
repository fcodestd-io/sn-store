import { error } from '@sveltejs/kit';
import { isUuid } from '#lib/server/admin-query.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!isUuid(params.id)) error(404, 'Order tidak ditemukan.');

	const { data: order, error: orderError } = await locals.supabase
		.from('orders')
		.select(
			'id, order_number, source, customer_name, customer_email, customer_phone, telegram_chat_id, status, currency, total_amount, notes, created_at, paid_at, completed_at, fulfilled_at'
		)
		.eq('id', params.id)
		.maybeSingle();

	if (orderError) {
		console.error('Failed to load order:', orderError.message);
		error(500, 'Order gagal dimuat.');
	}

	if (!order) error(404, 'Order tidak ditemukan.');

	const [items, payments, assignments] = await Promise.all([
		locals.supabase
			.from('order_items')
			.select('id, product_id, product_name, unit_price, quantity, line_total')
			.eq('order_id', order.id)
			.order('created_at', { ascending: true }),
		locals.supabase
			.from('payments')
			.select(
				'id, provider, external_id, payment_method, amount, status, paid_at, expires_at, created_at'
			)
			.eq('order_id', order.id)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('account_assignments')
			.select('id, product_account_id, slot_number, delivered_at, created_at')
			.eq('order_id', order.id)
			.order('created_at', { ascending: true })
	]);

	// Hanya nama & email akun yang ditampilkan; password tidak pernah dikirim ke halaman ini.
	const accountIds = [
		...new Set((assignments.data ?? []).map((row) => row.product_account_id as string))
	];
	const accounts = accountIds.length
		? await locals.supabase
				.from('product_accounts')
				.select('id, name, login_email')
				.in('id', accountIds)
		: { data: [], error: null };

	const accountById = new Map(
		(accounts.data ?? []).map((account) => [account.id as string, account])
	);

	return {
		order,
		items: items.data ?? [],
		payments: payments.data ?? [],
		assignments: (assignments.data ?? []).map((row) => ({
			...row,
			account: accountById.get(row.product_account_id as string) ?? null
		})),
		assignmentsUnavailable: Boolean(assignments.error)
	};
};
