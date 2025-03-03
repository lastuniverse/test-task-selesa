// import { resolve } from 'path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
  },
  // build: {
  //   lib: {
  //     entry: resolve(__dirname, 'src/index.ts'),
  //     name: 'ohae',
  //     fileName: 'ohae',
  //   },
  // },
  // plugins: [dts()],  
  base: './', // Используем относительные пути
});
