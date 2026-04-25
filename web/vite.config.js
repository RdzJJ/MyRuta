import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  define: {
    '__ENV__': {
      API_URL: JSON.stringify(process.env.VITE_API_URL),
      SOCKET_URL: JSON.stringify(process.env.VITE_SOCKET_URL)
    }
  }
})
