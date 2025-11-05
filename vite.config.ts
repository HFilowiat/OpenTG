import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';
import tsconfig from './tsconfig.json' with { type: 'json' };

const aliasPaths = Object.entries(tsconfig.compilerOptions.paths).map(([find, [replacement]]) => {
	find = find.replace('/*', '');
	replacement = replacement.replace('/*', '');

	return { find, replacement: path.resolve(replacement) };
});

export default defineConfig(({ command, mode }) => {
	return {
		plugins: [sveltekit()],
		esbuild: {
			drop:
				command === 'build' && (mode === 'platform-web' || mode === 'platform-windows')
					? ['console', 'debugger']
					: []
		},

		resolve: {
			alias: aliasPaths
		}
	};
});
