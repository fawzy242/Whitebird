import { defineConfig, loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isBuild = command === 'build';

  return {
    root: './',
    base: isProduction ? '/' : '/',
    build: {
      outDir: 'wwwroot',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: isProduction ? false : 'inline',
      minify: isProduction ? 'terser' : false,
      cssMinify: isProduction,
      target: 'es2015',
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            format: {
              comments: false,
            },
          }
        : {},
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks(id) {
            // Optimize chunk splitting
            if (id.includes('node_modules')) {
              if (id.includes('bootstrap') || id.includes('@popperjs')) {
                return 'vendor-bootstrap';
              }
              if (id.includes('axios')) {
                return 'vendor-axios';
              }
              if (id.includes('chart.js')) {
                return 'vendor-chart';
              }
              if (id.includes('fontawesome')) {
                return 'vendor-fontawesome';
              }
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            const ext = name?.split('.').pop() || '';

            // Font files
            if (['woff', 'woff2', 'ttf', 'eot', 'otf'].includes(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }

            // Image files
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
              return 'assets/img/[name]-[hash][extname]';
            }

            // CSS files
            if (ext === 'css') {
              return 'assets/css/[name]-[hash][extname]';
            }

            // Default
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      chunkSizeWarningLimit: 800,
      reportCompressedSize: false,
    },
    publicDir: 'public',
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      port: 3001,
      host: true,
      open: true,
    },
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11'],
        modernPolyfills: true,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
      extensions: ['.js', '.json', '.css', '.scss'],
    },
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `
            $primary: #dc3545;
            $secondary: #6c757d;
            $success: #28a745;
            $info: #17a2b8;
            $warning: #ffc107;
            $danger: #dc3545;
            $light: #f8f9fa;
            $dark: #343a40;
            $font-family-sans-serif: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          `,
        },
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_API_TIMEOUT': JSON.stringify(env.VITE_API_TIMEOUT),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV),
      'import.meta.env.VITE_DEBUG': JSON.stringify(env.VITE_DEBUG),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': JSON.stringify(isProduction),
      'import.meta.env.DEV': JSON.stringify(!isProduction),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify('2.0.0'),
      'import.meta.env.VITE_APP_NAME': JSON.stringify('RedAdmin Pro'),
    },
    optimizeDeps: {
      include: ['bootstrap', 'axios', 'chart.js', '@fortawesome/fontawesome-free'],
      exclude: [],
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
      pure: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
    },
  };
});
