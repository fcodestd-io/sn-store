/**
 * Bentuk baris tabel Supabase yang dipakai bot & webhook.
 * Skema asli ada di database; tipe ini hanya mencakup kolom yang dibaca/ditulis.
 */

export type Product = {
	id: string;
	name: string;
	description: string | null;
	image_url: string | null;
	price: number | string;
	is_active: boolean;
};

export type BotCommand = {
	command: string;
	response: string;
	is_active: boolean;
};

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';

export type AccountDelivery = {
	assignment_id: string;
	order_id: string;
	order_number: string;
	chat_id: string;
	product_name: string;
	account_name: string;
	login_email: string | null;
	login_password: string | null;
	notes: string | null;
};

export type AccountUsage = {
	product_id: string;
	max_users: number | null;
	used_count: number;
};
