import fs from 'fs'
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import resolve from 'rollup-plugin-node-resolve';
import replace from "rollup-plugin-replace";
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		postcss({ extract: true }),
		replace({ "dev": !production }),
		json(),
		svelte({
			preprocess: sveltePreprocess({ postcss: true }),
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
				// css: css => {
				// 	css.write('public/build/bundle.css');
				// }
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			preferBuiltins: true,
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),
		globals(),
		builtins(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload({
			watch: 'public',
			https: {
      	key: fs.readFileSync('/var/localhost.key'),
      	cert: fs.readFileSync('/var/localhost.crt')
  		}
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
