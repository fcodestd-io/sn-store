import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { data, error } = await locals.supabase.rpc('sn_store_health_check');

	if (error) {
		console.error('Supabase health check failed:', error.message);

		return json(
			{
				ok: false,
				message: 'Supabase connection check failed.'
			},
			{ status: 500 }
		);
	}

	return json({
		ok: data === 'sn-store-db-ok',
		service: 'supabase',
		database: data === 'sn-store-db-ok' ? 'connected' : 'unexpected-response'
	});
};
