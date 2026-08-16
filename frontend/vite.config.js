import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The pdf.js worker is a single large asset by nature; the warning at the
    // default 500 kB is noise once vendor code is split out below.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          pdf: ['react-pdf-highlighter', 'pdfjs-dist'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
