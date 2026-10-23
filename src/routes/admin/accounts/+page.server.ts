import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';

	let query = locals.supabase
		.from('products')
		.select('id, name, slug, price, product_type, is_active')
		.order('name', { ascending: true });

	if (q) {
		query = query.ilike('name', `%${q}%`);
	}

	const { data: products, error } = await query;

	if (error) {
		console.error('Failed to load products for account management:', error);
		return {
			products: [],
			q,
			error: 'Produk gagal dimuat. Silakan coba lagi.'
		};
	}

	return {
		products: products ?? [],
		q,
		error: null
	};
};
