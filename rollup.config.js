import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },
  plugins: [
    replace({
      DEV_MODE: !production
    }),
    // postcss({
    //   extract: true
    // }),
    svelte({
      compilerOptions: { dev: !production },
    }),
    postcss({ extract: path.resolve('public/bundle.css') }),
    resolve({ browser: true, dedupe: ['svelte'] }),
    commonjs(),
    !production & serve(),
    !production & livereload('public'),
    // !production && livereload({ watch: 'public', port: 8080 }),
    production && terser()
  ],
  watch: {
    clearScreen: false
  }
};
