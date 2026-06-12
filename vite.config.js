import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Split React into its own chunk
          vendor:   ['react', 'react-dom'],
        },
      },
    },
    // Increase warning limit since Firebase is large
    chunkSizeWarningLimit: 600,
  },
})
