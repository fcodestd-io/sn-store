import { bot } from './context.ts';
import { registerHandlers } from './handlers.ts';

let ready = false;

/**
 * Bot dengan seluruh handler terpasang (sekali per proses).
 * Dipakai oleh polling lokal (bot.ts) maupun webhook Vercel.
 */
export function getBot() {
	if (!ready) {
		registerHandlers();
		ready = true;
	}

	return bot;
}
