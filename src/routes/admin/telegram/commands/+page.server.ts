import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type CommandForm = {
	command: string;
	response: string;
	is_active: boolean;
};

async function requireAdmin(locals: App.Locals): Promise<void> {
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
		console.error('Telegram command admin verification failed:', roleError.message);
		throw error(500, 'Gagal memverifikasi hak akses admin.');
	}

	if (role?.role !== 'admin') {
		throw error(403, 'Anda tidak memiliki akses ke dashboard admin.');
	}
}

function parseCommand(formData: FormData): { value: CommandForm } | { message: string } {
	const command = String(formData.get('command') ?? '')
		.trim()
		.replace(/^\/+/, '')
		.toLowerCase();

	const response = String(formData.get('response') ?? '').trim();
	const isActive = formData.get('is_active') === 'on';

	if (!/^[a-z0-9_]{1,32}$/.test(command)) {
		return {
			message:
				'Command wajib diisi, maksimal 32 karakter, dan hanya boleh berisi huruf kecil, angka, atau underscore.'
		};
	}

	if (!response) {
		return {
			message: 'Response bot wajib diisi.'
		};
	}

	if (response.length > 4000) {
		return {
			message: 'Response maksimal 4000 karakter.'
		};
	}

	return {
		value: {
			command,
			response,
			is_active: isActive
		}
	};
}

function databaseMessage(code?: string): string {
	if (code === '23505') {
		return 'Command tersebut sudah digunakan.';
	}

	return 'Operasi gagal. Periksa struktur tabel dan policy RLS.';
}

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);

	const { data: commands, error: queryError } = await locals.supabase
		.from('bot_commands')
		.select('id, command, response, is_active, created_at, updated_at')
		.order('created_at', { ascending: false });

	if (queryError) {
		console.error('Failed to load Telegram commands:', queryError.message);

		return {
			commands: [],
			loadError:
				'Daftar command gagal dimuat. Pastikan tabel bot_commands memiliki kolom command dan response.'
		};
	}

	return {
		commands: commands ?? [],
		loadError: null
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		await requireAdmin(locals);

		const parsed = parseCommand(await request.formData());

		if ('message' in parsed) {
			return fail(400, {
				message: parsed.message,
				operation: 'create'
			});
		}

		const { error: insertError } = await locals.supabase.from('bot_commands').insert(parsed.value);

		if (insertError) {
			console.error('Create Telegram command failed:', insertError.message);

			return fail(400, {
				message: databaseMessage(insertError.code),
				operation: 'create'
			});
		}

		throw redirect(303, '/admin/telegram/commands');
	},

	update: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();
		const parsed = parseCommand(formData);

		if (!id || id.length > 100) {
			return fail(400, {
				message: 'ID command tidak valid.',
				operation: 'update'
			});
		}

		if ('message' in parsed) {
			return fail(400, {
				message: parsed.message,
				operation: 'update'
			});
		}

		const { data, error: updateError } = await locals.supabase
			.from('bot_commands')
			.update(parsed.value)
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (updateError || !data) {
			console.error('Update Telegram command failed:', updateError?.message);

			return fail(400, {
				message: databaseMessage(updateError?.code),
				operation: 'update'
			});
		}

		throw redirect(303, '/admin/telegram/commands');
	},

	toggle: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();
		const isActive = formData.get('is_active') === 'true';

		if (!id || id.length > 100) {
			return fail(400, {
				message: 'ID command tidak valid.',
				operation: 'toggle'
			});
		}

		const { data, error: updateError } = await locals.supabase
			.from('bot_commands')
			.update({ is_active: isActive })
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (updateError || !data) {
			console.error('Toggle Telegram command failed:', updateError?.message);

			return fail(400, {
				message: 'Status command gagal diperbarui.',
				operation: 'toggle'
			});
		}

		throw redirect(303, '/admin/telegram/commands');
	},

	delete: async ({ request, locals }) => {
		await requireAdmin(locals);

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();

		if (!id || id.length > 100) {
			return fail(400, {
				message: 'ID command tidak valid.',
				operation: 'delete'
			});
		}

		const { data, error: deleteError } = await locals.supabase
			.from('bot_commands')
			.delete()
			.eq('id', id)
			.select('id')
			.maybeSingle();

		if (deleteError || !data) {
			console.error('Delete Telegram command failed:', deleteError?.message);

			return fail(400, {
				message: databaseMessage(deleteError?.code),
				operation: 'delete'
			});
		}

		throw redirect(303, '/admin/telegram/commands');
	}
};
