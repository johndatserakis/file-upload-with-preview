import { defineConfig } from 'vite';

export default defineConfig({
  base: '/file-upload-with-preview/', // For GitHub docs support
  build: {
    outDir: '../docs', // Actual root "docs" folder because we're in "root" context here
  },
  root: 'example',
});
