import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'AbilitySounds/*.mp3',
          dest: 'sounds',
        },
      ],
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
});
