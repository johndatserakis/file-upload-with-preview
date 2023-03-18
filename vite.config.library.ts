import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/**
 * Vite Library Mode: https://vitejs.dev/guide/build.html#library-mode
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'file-upload-with-preview',
      formats: ['es', 'cjs', 'iife'],
      name: 'FileUploadWithPreview',
    },
    outDir: './dist',
    rollupOptions: {
      external: [], // 'react', 'vue'
      output: {
        globals: {}, // react: 'React'
      },
    },
  },
  plugins: [dts()],
});
