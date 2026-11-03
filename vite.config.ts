import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Deploy ke Vercel. Bot Telegram berjalan sebagai webhook (src/routes/api/telegram).
			// Runtime ditetapkan eksplisit agar build tidak gagal bila Node di mesin build
			// bukan 22/24 (adapter hanya mendukung keduanya).
			adapter: adapter({ runtime: 'nodejs24.x' })
		})
	]
});
