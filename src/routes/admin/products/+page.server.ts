import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const BUCKET = 'product-images';
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
} as const;

type UploadedImage = {
	url: string;
	path: string;
};

function makeSlug(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function requireAdmin(locals: App.Locals) {
	const {
		data: { user },
		error: authError
	} = await locals.supabase.auth.getUser();

	if (authError || !user) {
		throw redirect(303, '/login');
	}

	const { data: role, error: roleError } = await locals.supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', user.id)
		.maybeSingle();

	if (roleError) {
		console.error('Admin role verification failed:', roleError.message);
		throw error(500, 'Gagal memverifikasi hak akses admin.');
	}

	if (role?.role !== 'admin') {
		throw error(403, 'Anda tidak memiliki akses ke dashboard admin.');
	}
}

function parseProduct(formData: FormData) {
	const name = String(formData.get('name') ?? '').trim();
	const description = String(formData.get('description') ?? '').trim();
	const submittedSlug = String(formData.get('slug') ?? '').trim();
	const categoryValue = String(formData.get('category_id') ?? '').trim();
	const type = String(formData.get('product_type') ?? 'digital');
	const priceText = String(formData.get('price') ?? '').trim();
	const stockText = String(formData.get('stock_quantity') ?? '').trim();

	const slug = makeSlug(submittedSlug || name);
	const price = Number(priceText);
	const stock = stockText === '' ? null : Number(stockText);

	if (!name || name.length > 160) {
		return { error: 'Nama produk wajib diisi dan maksimal 160 karakter.' } as const;
	}

	if (!slug || slug.length > 180) {
		return { error: 'Slug produk tidak valid.' } as const;
	}

	if (!priceText || !Number.isSafeInteger(price) || price < 0 || price > 9000000000000000) {
		return { error: 'Harga harus berupa bilangan bulat Rupiah yang valid.' } as const;
	}

	if (type !== 'digital' && type !== 'service') {
		return { error: 'Jenis produk tidak valid.' } as const;
	}

	if (stock !== null && (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647)) {
		return { error: 'Stok harus berupa bilangan bulat nol atau lebih.' } as const;
	}

	return {
		value: {
			name,
			slug,
			description: description || null,
			category_id: categoryValue || null,
			product_type: type,
			price,
			stock_quantity: stock
		}
	} as const;
}

function getImageFile(formData: FormData): { file: File | null } | { error: string } {
	const entry = formData.get('image');

	if (entry === null) {
		return { file: null };
	}

	if (typeof entry === 'string') {
		if (entry.trim()) {
			return { error: 'File gambar tidak valid.' };
		}

		return { file: null };
	}

	if (entry.size === 0) {
		return { file: null };
	}

	if (entry.size > MAX_IMAGE_SIZE) {
		return { error: 'Ukuran gambar maksimal 2 MB.' };
	}

	if (!Object.hasOwn(ALLOWED_IMAGE_TYPES, entry.type)) {
		return { error: 'Format gambar harus JPEG, PNG, atau WebP.' };
	}

	return { file: entry };
}

async function uploadImage(locals: App.Locals, file: File): Promise<UploadedImage | null> {
	const extension = ALLOWED_IMAGE_TYPES[file.type as keyof typeof ALLOWED_IMAGE_TYPES];

	const path = `${crypto.randomUUID()}.${extension}`;

	const { error: uploadError } = await locals.supabase.storage.from(BUCKET).upload(path, file, {
		contentType: file.type,
		cacheControl: '3600',
		upsert: false
	});

	if (uploadError) {
		console.error('Product image upload failed:', uploadError.message);
		throw new Error('Gambar gagal diunggah. Periksa konfigurasi Storage dan policy.');
	}

	const { data } = locals.supabase.storage.from(BUCKET).getPublicUrl(path);

	return {
		url: data.publicUrl,
		path
	};
}

/**
 * Mengambil path file dari public URL bucket kita sendiri.
 * URL eksternal atau URL dari bucket lain tidak akan dihapus.
 */
function getBucketPath(imageUrl: string | null): string | null {
	if (!imageUrl) return null;

	try {
		const url = new URL(imageUrl);
		const marker = `/storage/v1/object/public/${BUCKET}/`;

		if (!url.pathname.includes(marker)) {
			return null;
		}

		const path = url.pathname.split(marker)[1];

		if (!path) return null;

		return decodeURIComponent(path);
	} catch {
		return null;
	}
}

async function removeUploadedFile(locals: App.Locals, path: string | null): Promise<void> {
	if (!path) return;

	const { error: removeError } = await locals.supabase.storage.from(BUCKET).remove([path]);

	if (removeError) {
		console.error('Product image cleanup failed:', removeError.message, path);
	}
}

async function removeOldProductImage(
	locals: App.Locals,
	oldImageUrl: string | null,
	newImageUrl: string | null
): Promise<void> {
	if (!oldImageUrl || oldImageUrl === newImageUrl) return;

	await removeUploadedFile(locals, getBucketPath(oldImageUrl));
}

export const load: PageServerLoad = async ({ locals }) => {
	const [productsResult, categoriesResult] = await Promise.all([
		locals.supabase
			.from('products')
			.select(
				`
				id,
				name,
				slug,
				description,
				image_url,
				price,
				product_type,
				stock_quantity,
				is_active,
				category_id,
				created_at,
				categories(name)
			`
			)
			.order('created_at', { ascending: false }),

		locals.supabase.from('categories').select('id, name').eq('is_active', true).order('name')
	]);

	if (productsResult.error || categoriesResult.error) {
		console.error(
			'Failed to load product page:',
			productsResult.error?.message,
			categoriesResult.error?.message
		);

		return {
			products: [],
			categories: [],
			loadError: 'Data katalog gagal dimuat. Silakan muat ulang halaman.'
		};
	}

	return {
		products: productsResult.data ?? [],
		categories: categoriesResult.data ?? [],
		loadError: null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();
		const parsed = parseProduct(formData);
		const imageResult = getImageFile(formData);

		if ('error' in parsed) {
			return fail(400, {
				message: parsed.error,
				operation: 'create'
			});
		}

		if ('error' in imageResult) {
			return fail(400, {
				message: imageResult.error,
				operation: 'create'
			});
		}

		let uploaded: UploadedImage | null = null;

		try {
			if (imageResult.file) {
				uploaded = await uploadImage(locals, imageResult.file);
			}
		} catch (cause) {
			return fail(400, {
				message: cause instanceof Error ? cause.message : 'Gambar gagal diunggah.',
				operation: 'create'
			});
		}

		const { error: insertError } = await locals.supabase.from('products').insert({
			...parsed.value,
			image_url: uploaded?.url ?? null
		});

		if (insertError) {
			console.error('Create product failed:', insertError.message);

			// Hindari file yatim jika penyimpanan produk gagal.
			await removeUploadedFile(locals, uploaded?.path ?? null);

			return fail(400, {
				message:
					insertError.code === '23505'
						? 'Slug produk sudah digunakan.'
						: 'Produk gagal dibuat. Periksa data dan hak akses.',
				operation: 'create'
			});
		}

		throw redirect(303, '/admin/products');
	},

	update: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();
		const isActive = formData.get('is_active') === 'on';
		const parsed = parseProduct(formData);
		const imageResult = getImageFile(formData);

		if (!id) {
			return fail(400, {
				message: 'ID produk tidak valid.',
				operation: 'update'
			});
		}

		if ('error' in parsed) {
			return fail(400, {
				message: parsed.error,
				operation: 'update'
			});
		}

		if ('error' in imageResult) {
			return fail(400, {
				message: imageResult.error,
				operation: 'update'
			});
		}

		const { data: existing, error: findError } = await locals.supabase
			.from('products')
			.select('id, image_url')
			.eq('id', id)
			.maybeSingle();

		if (findError) {
			console.error('Find product failed:', findError.message);

			return fail(500, {
				message: 'Data produk gagal diperiksa.',
				operation: 'update'
			});
		}

		if (!existing) {
			return fail(404, {
				message: 'Produk tidak ditemukan.',
				operation: 'update'
			});
		}

		let uploaded: UploadedImage | null = null;

		try {
			if (imageResult.file) {
				uploaded = await uploadImage(locals, imageResult.file);
			}
		} catch (cause) {
			return fail(400, {
				message: cause instanceof Error ? cause.message : 'Gambar gagal diunggah.',
				operation: 'update'
			});
		}

		// Tidak memilih gambar baru berarti gambar lama tetap digunakan.
		const nextImageUrl = uploaded?.url ?? existing.image_url;

		const { data, error: updateError } = await locals.supabase
			.from('products')
			.update({
				...parsed.value,
				image_url: nextImageUrl,
				is_active: isActive
			})
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (updateError || !data) {
			console.error('Update product failed:', updateError?.message);

			// Produk lama tidak berubah; bersihkan upload baru yang gagal dipakai.
			await removeUploadedFile(locals, uploaded?.path ?? null);

			return fail(400, {
				message:
					updateError?.code === '23505'
						? 'Slug produk sudah digunakan.'
						: 'Produk gagal diperbarui.',
				operation: 'update'
			});
		}

		// Hapus gambar lama hanya setelah update database berhasil.
		if (uploaded) {
			await removeOldProductImage(locals, existing.image_url, nextImageUrl);
		}

		throw redirect(303, '/admin/products');
	},

	delete: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();

		if (!id) {
			return fail(400, {
				message: 'ID produk tidak valid.',
				operation: 'delete'
			});
		}

		const { data: existing, error: findError } = await locals.supabase
			.from('products')
			.select('id, image_url')
			.eq('id', id)
			.maybeSingle();

		if (findError) {
			console.error('Find product for deletion failed:', findError.message);

			return fail(500, {
				message: 'Produk gagal diperiksa sebelum dihapus.',
				operation: 'delete'
			});
		}

		if (!existing) {
			return fail(404, {
				message: 'Produk tidak ditemukan.',
				operation: 'delete'
			});
		}

		const { data, error: deleteError } = await locals.supabase
			.from('products')
			.delete()
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (deleteError || !data) {
			console.error('Delete product failed:', deleteError?.message);

			return fail(400, {
				message: 'Produk gagal dihapus.',
				operation: 'delete'
			});
		}

		// URL eksternal tidak akan dihapus; hanya file di bucket product-images.
		await removeUploadedFile(locals, getBucketPath(existing.image_url));

		throw redirect(303, '/admin/products');
	}
};
