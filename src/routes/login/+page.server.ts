import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();

		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(400, {
				message: 'Email dan password wajib diisi.',
				email
			});
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return fail(400, {
				message: 'Login gagal. Periksa email, password, dan status akun.',
				email
			});
		}

		const {
			data: { user },
			error: userError
		} = await locals.supabase.auth.getUser();

		if (userError || !user) {
			await locals.supabase.auth.signOut();

			return fail(401, {
				message: 'Sesi login tidak dapat diverifikasi.',
				email
			});
		}

		const { data: role, error: roleError } = await locals.supabase
			.from('user_roles')
			.select('role')
			.eq('user_id', user.id)
			.maybeSingle();

		if (roleError || role?.role !== 'admin') {
			await locals.supabase.auth.signOut();

			return fail(403, {
				message: 'Akun ini tidak memiliki akses admin.',
				email
			});
		}

		throw redirect(303, '/admin');
	}
};
