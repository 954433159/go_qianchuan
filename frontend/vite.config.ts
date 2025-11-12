import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React核心库
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }
          
          // UI组件库
          if (id.includes('node_modules/@radix-ui') || 
              id.includes('node_modules/lucide-react')) {
            return 'ui-vendor'
          }
          
          // 图表库
          if (id.includes('node_modules/@tremor') || 
              id.includes('node_modules/recharts')) {
            return 'chart-vendor'
          }
          
          // 表单库
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/@hookform') || 
              id.includes('node_modules/zod')) {
            return 'form-vendor'
          }
          
          // HTTP库
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor'
          }
          
          // 工具库
          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/class-variance-authority') || 
              id.includes('node_modules/tailwind-merge') || 
              id.includes('node_modules/date-fns')) {
            return 'utils-vendor'
          }
        },
      },
    },
  },
})
