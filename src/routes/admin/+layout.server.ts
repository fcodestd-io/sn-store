import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
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

	return {
		adminEmail: user.email ?? ''
	};
};
