import { defineConfig } from 'vite';

// base './': a pasta dist funciona em qualquer endereço (itch.io, GitHub Pages, uma subpasta...)
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2000 }, // o Phaser sozinho já passa do aviso padrão (500 kB)
});
