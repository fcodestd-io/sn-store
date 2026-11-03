import Midtrans, { type Snap } from 'midtrans-client';

export type MidtransConfig = {
	serverKey: string;
	clientKey: string;
	isProduction: boolean;
};

export function createSnapClient(config: MidtransConfig): Snap {
	return new Midtrans.Snap(config);
}
