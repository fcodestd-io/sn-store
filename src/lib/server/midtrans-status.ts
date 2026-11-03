import type { OrderStatus, PaymentStatus } from '../types/database.ts';

export type MidtransNotification = {
	order_id?: string;
	status_code?: string;
	gross_amount?: string;
	signature_key?: string;
	transaction_id?: string;
	transaction_status?: string;
	payment_type?: string;
	fraud_status?: string;
	settlement_time?: string;
};

export type MappedStatus = {
	payment: PaymentStatus;
	order: OrderStatus;
};

/** Memetakan status notifikasi Midtrans ke status payment & order internal. */
export function mapMidtransStatus(transactionStatus: string, fraudStatus?: string): MappedStatus {
	const fraud = fraudStatus?.toLowerCase();

	if (
		transactionStatus === 'settlement' ||
		(transactionStatus === 'capture' && fraud === 'accept')
	) {
		return { payment: 'paid', order: 'paid' };
	}

	switch (transactionStatus) {
		case 'expire':
			return { payment: 'expired', order: 'expired' };
		case 'cancel':
			return { payment: 'failed', order: 'cancelled' };
		case 'deny':
			return { payment: 'failed', order: 'pending' };
		case 'refund':
		case 'partial_refund':
			return { payment: 'refunded', order: 'refunded' };
		default:
			// pending, capture+challenge, dan status tak dikenal: belum dianggap dibayar.
			return { payment: 'pending', order: 'pending' };
	}
}
