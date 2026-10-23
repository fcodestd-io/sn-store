import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function makeSlug(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export const load: PageServerLoad = async ({ locals }) => {
	const { data: categories, error } = await locals.supabase
		.from('categories')
		.select('id, name, slug, description, is_active, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Failed to load categories:', error.message);

		return {
			categories: [],
			loadError: 'Kategori gagal dimuat. Silakan muat ulang halaman.'
		};
	}

	return {
		categories: categories ?? [],
		loadError: null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const submittedSlug = String(formData.get('slug') ?? '').trim();
		const slug = makeSlug(submittedSlug || name);

		if (!name || name.length > 80) {
			return fail(400, {
				message: 'Nama kategori wajib diisi dan maksimal 80 karakter.',
				operation: 'create'
			});
		}

		if (!slug || slug.length > 100) {
			return fail(400, {
				message: 'Slug kategori tidak valid.',
				operation: 'create'
			});
		}

		const { error } = await locals.supabase.from('categories').insert({
			name,
			slug,
			description: description || null
		});

		if (error) {
			console.error('Create category failed:', error.message);

			return fail(400, {
				message:
					error.code === '23505'
						? 'Slug kategori sudah digunakan.'
						: 'Kategori gagal dibuat. Periksa data dan hak akses.',
				operation: 'create'
			});
		}

		throw redirect(303, '/admin/categories');
	},

	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const submittedSlug = String(formData.get('slug') ?? '').trim();
		const slug = makeSlug(submittedSlug || name);
		const isActive = formData.get('is_active') === 'on';

		if (!id || !name || name.length > 80 || !slug || slug.length > 100) {
			return fail(400, {
				message: 'Data kategori tidak valid.',
				operation: 'update'
			});
		}

		const { data, error } = await locals.supabase
			.from('categories')
			.update({
				name,
				slug,
				description: description || null,
				is_active: isActive
			})
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (error || !data) {
			console.error('Update category failed:', error?.message);

			return fail(400, {
				message:
					error?.code === '23505' ? 'Slug kategori sudah digunakan.' : 'Kategori gagal diperbarui.',
				operation: 'update'
			});
		}

		throw redirect(303, '/admin/categories');
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id') ?? '');

		if (!id) {
			return fail(400, {
				message: 'ID kategori tidak valid.',
				operation: 'delete'
			});
		}

		const { data, error } = await locals.supabase
			.from('categories')
			.delete()
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (error || !data) {
			console.error('Delete category failed:', error?.message);

			return fail(400, {
				message: 'Kategori gagal dihapus.',
				operation: 'delete'
			});
		}

		throw redirect(303, '/admin/categories');
	}
};
