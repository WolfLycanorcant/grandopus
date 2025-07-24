import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // This allows external connections
    open: true,
    allowedHosts: ['wolf.ngrok.dev'],   // ← NEW
    cors: {
      origin: ['https://wolf.ngrok.dev', 'http://localhost:3000'], // allow the ngrok domain
      credentials: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})