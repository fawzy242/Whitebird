import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Mode akan otomatis dari command: 'development' atau 'production'
  const isProduction = mode === 'production';

  return {
    root: './',
    base: '/',
    build: {
      outDir: 'wwwroot',
      assetsDir: 'assets',
      sourcemap: false,
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          }
        : {},
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['axios'],
            ui: ['bootstrap'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    publicDir: 'public',
    server: {
      port: 3000,
      open: true,
      cors: true,
      // Proxy hanya untuk development
      proxy: !isProduction
        ? {
            '/api': {
              target: 'http://localhost:5000',
              changeOrigin: true,
              secure: false,
            },
            '/health': {
              target: 'http://localhost:5000',
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@config': resolve(__dirname, 'src/config'),
      },
    },
    // Define global constants
    define: {
      'import.meta.env.PROD': JSON.stringify(isProduction),
      'import.meta.env.DEV': JSON.stringify(!isProduction),
      'import.meta.env.MODE': JSON.stringify(mode),
    },
  };
});
