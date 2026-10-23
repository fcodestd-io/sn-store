import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const validStatuses = ['available', 'reserved', 'sold'] as const;

type AccountStatus = (typeof validStatuses)[number];

function textField(formData: FormData, key: string): string {
	const value = formData.get(key);
	return typeof value === 'string' ? value.trim() : '';
}

function parseAccount(formData: FormData) {
	const name = textField(formData, 'name');
	const loginEmail = textField(formData, 'login_email');
	const loginPassword = textField(formData, 'login_password');
	const rawPrice = textField(formData, 'price');
	const status = textField(formData, 'status');
	const notes = textField(formData, 'notes');

	const price = Number(rawPrice);

	if (!name || name.length > 150) {
		return { error: 'Nama akun wajib diisi (maksimal 150 karakter).' } as const;
	}

	if (!rawPrice || !Number.isFinite(price) || price < 0 || price > 9999999999.99) {
		return { error: 'Harga harus berupa angka yang valid dan tidak negatif.' } as const;
	}

	if (!validStatuses.includes(status as AccountStatus)) {
		return { error: 'Status akun tidak valid.' } as const;
	}

	if (loginEmail.length > 255 || notes.length > 2000) {
		return { error: 'Email atau catatan terlalu panjang.' } as const;
	}

	return {
		value: {
			name,
			login_email: loginEmail || null,
			price,
			status: status as AccountStatus,
			notes: notes || null
		},
		loginPassword
	} as const;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const { data: product, error: productError } = await locals.supabase
		.from('products')
		.select('id, name, slug, price, product_type, is_active')
		.eq('id', params.productId)
		.maybeSingle();

	if (productError) {
		console.error('Failed to load product:', productError);
		error(500, 'Produk gagal dimuat.');
	}

	if (!product) {
		error(404, 'Produk tidak ditemukan.');
	}

	const { data: accounts, error: accountsError } = await locals.supabase
		.from('product_accounts')
		.select('id, product_id, name, login_email, price, status, notes, created_at, updated_at')
		.eq('product_id', params.productId)
		.order('created_at', { ascending: false });

	if (accountsError) {
		console.error('Failed to load product accounts:', accountsError);
		error(500, 'Daftar akun/items gagal dimuat.');
	}

	return {
		product,
		accounts: accounts ?? []
	};
};

export const actions: Actions = {
	create: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const parsed = parseAccount(formData);

		if ('error' in parsed) {
			return fail(400, { error: parsed.error, action: 'create' });
		}

		const insertData = {
			...parsed.value,
			product_id: params.productId,
			...(parsed.loginPassword ? { login_password: parsed.loginPassword } : {})
		};

		const { error: insertError } = await locals.supabase
			.from('product_accounts')
			.insert(insertData);

		if (insertError) {
			console.error('Failed to create product account:', insertError);
			return fail(400, {
				error: 'Akun/items gagal ditambahkan. Periksa data dan konfigurasi Supabase.',
				action: 'create'
			});
		}

		redirect(303, `/admin/accounts/${params.productId}`);
	},

	update: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const id = textField(formData, 'id');
		const parsed = parseAccount(formData);

		if (!id) {
			return fail(400, { error: 'ID akun tidak valid.', action: 'update' });
		}

		if ('error' in parsed) {
			return fail(400, { error: parsed.error, action: 'update' });
		}

		const updateData = {
			...parsed.value,
			updated_at: new Date().toISOString(),
			...(parsed.loginPassword ? { login_password: parsed.loginPassword } : {})
		};

		const { data: updatedAccount, error: updateError } = await locals.supabase
			.from('product_accounts')
			.update(updateData)
			.eq('id', id)
			.eq('product_id', params.productId)
			.select('id')
			.maybeSingle();

		if (updateError) {
			console.error('Failed to update product account:', updateError);
			return fail(400, {
				error: 'Akun/items gagal diperbarui.',
				action: 'update'
			});
		}

		if (!updatedAccount) {
			return fail(404, {
				error: 'Akun tidak ditemukan pada produk ini.',
				action: 'update'
			});
		}

		redirect(303, `/admin/accounts/${params.productId}`);
	},

	delete: async ({ request, locals, params }) => {
		const formData = await request.formData();
		const id = textField(formData, 'id');

		if (!id) {
			return fail(400, { error: 'ID akun tidak valid.', action: 'delete' });
		}

		const { data: deletedAccount, error: deleteError } = await locals.supabase
			.from('product_accounts')
			.delete()
			.eq('id', id)
			.eq('product_id', params.productId)
			.select('id')
			.maybeSingle();

		if (deleteError) {
			console.error('Failed to delete product account:', deleteError);
			return fail(400, {
				error: 'Akun/items gagal dihapus.',
				action: 'delete'
			});
		}

		if (!deletedAccount) {
			return fail(404, {
				error: 'Akun tidak ditemukan pada produk ini.',
				action: 'delete'
			});
		}

		redirect(303, `/admin/accounts/${params.productId}`);
	}
};
