import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({}),

		version: {
			name: process.env.npm_package_version
		},

		paths: {
			relative: true
		},

		prerender: {
			handleHttpError: 'warn',
			entries: [
				'/[saveId]',
				'/[saveId]/bankrupt',
				'/[saveId]/company',
				'/[saveId]/employee',
				'/[saveId]/game',
				'/[saveId]/game/[gameId]',
				'/[saveId]/game/[gameId]/distribution',
				'/[saveId]/hardware',
				'/[saveId]/hardware/[hardwareId]',
				'/[saveId]/hardware/[hardwareId]/production',
				'/[saveId]/market',
				'/[saveId]/news',
				'/[saveId]/research',
				'/settings',
				'/',
				'/character',
				'/credits',
				'/loadgame',
				'/mods',
				'/newgame',
				'/globe'
			]
		}
	}
};

export default config;
