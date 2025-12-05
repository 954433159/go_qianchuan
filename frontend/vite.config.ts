import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.node'],
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 大于 10KB 才压缩
      deleteOriginFile: false,
    }),
    // Brotli 压缩 (更高压缩率)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // 排除Playwright相关包，避免构建时出错
    exclude: [
      '@playwright/test',
      'playwright',
      'chromium-bidi',
      'playwright-core',
      'chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
      'chromium-bidi/lib/cjs/cdp/CdpConnection',
    ],
  },
  define: {
    global: 'globalThis',
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
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true, // CSS 代码分割
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除特定函数
      },
    },
    rollupOptions: {
      external: [
        // 排除Playwright相关包，避免构建错误
        /^@playwright\/test/,
        /^playwright/,
        /^playwright-core/,
        /^chromium-bidi/,
        /\.node$/,
      ],
      output: {
        manualChunks: (id) => {
          // React核心库及其相关依赖 - 合并在一个chunk中避免循环依赖
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/@tremor') ||
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/scheduler') ||
            id.includes('node_modules/use') ||
            id.includes('node_modules/object-assign')
          ) {
            return 'react-vendor'
          }

          // UI组件库
          if (
            id.includes('node_modules/@radix-ui') ||
            id.includes('node_modules/lucide-react')
          ) {
            return 'ui-vendor'
          }

          // 表单库
          if (
            id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/@hookform') ||
            id.includes('node_modules/zod')
          ) {
            return 'form-vendor'
          }

          // HTTP库
          if (id.includes('node_modules/axios')) {
            return 'axios-vendor'
          }

          // 工具库
          if (
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/class-variance-authority') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/date-fns')
          ) {
            return 'utils-vendor'
          }
        },
      },
    },
  },
})
