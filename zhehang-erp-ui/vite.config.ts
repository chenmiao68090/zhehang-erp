import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  const localPreviewEnabled = command === 'serve' && env.VITE_ENABLE_LOCAL_PREVIEW === 'true'
  return {
    // Vue-i18n 默认会用 `new Function` 编译消息，与生产严格 CSP 冲突。
    // 9.3+ 的 JIT AST 模式不依赖 eval，可继续支持现有 TypeScript 消息字典。
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_JIT_COMPILATION__: true,
      __INTLIFY_DROP_MESSAGE_COMPILER__: false
    },
    plugins: [
      vue(),
      {
        name: 'html-transform-env',
        transformIndexHtml(html: string) {
          return html.replace(/%VITE_APP_TITLE%/g, env.VITE_APP_TITLE || '浙杭集团CRM')
        }
      },
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-imports.d.ts'
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: 'src/components.d.ts'
      })
    ],
    resolve: {
      alias: {
        '@local-preview-routes': resolve(__dirname, localPreviewEnabled
          ? 'src/router/local-preview-routes.development.ts'
          : 'src/router/local-preview-routes.production.ts'),
        '@feige-order-data-source': resolve(__dirname, localPreviewEnabled
          ? 'src/views/feige-order-contract/data-source.ts'
          : 'src/views/feige-order-contract/data-source.production.ts'),
        '@feige-task-data-source': resolve(__dirname, localPreviewEnabled
          ? 'src/views/task-workbench/data-source.ts'
          : 'src/views/task-workbench/data-source.production.ts'),
        '@feige-suite-data-source': resolve(__dirname, localPreviewEnabled
          ? 'src/views/feige-suite/data-source.ts'
          : 'src/views/feige-suite/data-source.production.ts'),
        '@': resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true
        },
        '/ws': {
          target: env.VITE_PROXY_TARGET || 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ws/, '/api/ws')
        }
      }
    },
    build: {
      target: 'es2015',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          // Manual chunk splitting to optimize bundle size
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('element-plus') || id.includes('@element-plus')) {
                return 'vendor-element-plus'
              }
              if (id.includes('echarts') || id.includes('zrender')) {
                return 'vendor-echarts'
              }
              if (id.includes('vue') && !id.includes('vue-i18n')) {
                return 'vendor-vue'
              }
              if (id.includes('vue-i18n') || id.includes('@intlify')) {
                return 'vendor-i18n'
              }
              if (id.includes('dayjs')) {
                return 'vendor-dayjs'
              }
              if (id.includes('axios')) {
                return 'vendor-axios'
              }
              return 'vendor'
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      }
    }
  }
})
