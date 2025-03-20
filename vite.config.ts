import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { promises as fs } from 'fs';

// Plugin to copy _redirects file to dist during build
const copyRedirects = () => {
  return {
    name: 'copy-redirects',
    async writeBundle() {
      try {
        await fs.copyFile('_redirects', 'dist/_redirects');
        console.log('✅ _redirects file copied to dist');
      } catch (error) {
        console.error('Error copying _redirects file:', error);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files based on mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      copyRedirects()
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react', 
              'react-dom', 
              'react-router-dom',
              'zustand'
            ],
            monaco: ['monaco-editor'],
            ui: ['lucide-react'],
          }
        }
      }
    },
    // Use relative paths for deployments
    base: './',
    // Make env variables available in the app
    define: {
      // This allows proper types for import.meta.env
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY || ''),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
      'import.meta.env.VITE_STORAGE_PREFIX': JSON.stringify(env.VITE_STORAGE_PREFIX || ''),
    },
  }
});
