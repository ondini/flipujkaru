import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Oddělené vendor chunky → lepší cachování + 3D mimo initial bundle
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Celý strom R3F → vlastní chunk (jen s lazy 3D scénou). Musí být PRVNÍ.
          if (
            id.includes('three') ||
            id.includes('@react-three') ||
            id.includes('react-reconciler') ||
            id.includes('zustand') ||
            id.includes('react-use-measure') ||
            id.includes('suspend-react') ||
            id.includes('its-fine')
          ) return 'three3d';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('react')) return 'react-vendor';
          return 'vendor';
        },
      },
    },
  },
});
