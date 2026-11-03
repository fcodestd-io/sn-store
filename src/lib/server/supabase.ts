import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type ServiceClient = SupabaseClient;

/** Client dengan service role: hanya untuk proses server (bot & webhook). */
export function createServiceClient(url: string, serviceRoleKey: string): ServiceClient {
	return createClient(url, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false }
	});
}
