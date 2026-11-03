declare module 'midtrans-client' {
	export type SnapConfig = {
		isProduction: boolean;
		serverKey: string;
		clientKey: string;
	};

	export type SnapTransactionParams = {
		transaction_details: { order_id: string; gross_amount: number };
		item_details?: Array<{ id: string; price: number; quantity: number; name: string }>;
		customer_details?: { first_name?: string; last_name?: string; email?: string; phone?: string };
		enabled_payments?: string[];
		expiry?: { unit: 'minute' | 'hour' | 'day'; duration: number };
		[key: string]: unknown;
	};

	export type SnapTransaction = {
		token: string;
		redirect_url: string;
	};

	export class Snap {
		constructor(config: SnapConfig);
		createTransaction(params: SnapTransactionParams): Promise<SnapTransaction>;
	}

	const Midtrans: { Snap: typeof Snap };
	export default Midtrans;
}
