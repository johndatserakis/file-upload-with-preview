import { defineConfig } from 'vite';

export default defineConfig({
  base: '/file-upload-with-preview/', // For GitHub docs support
  build: {
    outDir: '../docs',
  },
  root: 'example',
});
