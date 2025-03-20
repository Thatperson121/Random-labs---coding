import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { promises as fs } from 'fs';

// Plugin to copy Netlify configuration files to dist during build
const copyNetlifyFiles = () => {
  return {
    name: 'copy-netlify-files',
    async writeBundle() {
      try {
        // Copy _redirects file
        await fs.copyFile('_redirects', 'dist/_redirects');
        console.log('✅ _redirects file copied to dist');
        
        // Ensure headers file is copied from public if it exists
        try {
          await fs.copyFile('public/_headers', 'dist/_headers');
          console.log('✅ _headers file copied to dist');
        } catch (e) {
          console.log('No _headers file found, skipping');
        }
      } catch (error) {
        console.error('Error copying Netlify files:', error);
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files based on mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');
  
  // SECURITY FIX: Filter out sensitive environment variables
  // Only include variables with VITE_ prefix and ensure sensitive keys are not included
  const safeEnv = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith('VITE_'))
      // Explicitly exclude any sensitive variables that might have VITE_ prefix
      .filter(([key]) => !key.includes('API_KEY') || key === 'VITE_AI_FEATURES_ENABLED')
  );
  
  return {
    plugins: [
      react(),
      copyNetlifyFiles()
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === 'development',
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
    // Make env variables available in the app - ONLY include safe variables
    define: {
      // This allows proper types for import.meta.env and ensures API keys are not exposed
      ...Object.fromEntries(
        Object.entries(safeEnv).map(
          ([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]
        )
      ),
      // Add specific safe environment variables
      'import.meta.env.VITE_AI_FEATURES_ENABLED': JSON.stringify(env.VITE_AI_FEATURES_ENABLED || 'false'),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
      'import.meta.env.VITE_STORAGE_PREFIX': JSON.stringify(env.VITE_STORAGE_PREFIX || 'codecollab'),
      // Add placeholder for any OpenAI-related variables instead of the actual key
      'import.meta.env.VITE_OPENAI_AVAILABLE': JSON.stringify(!!env.OPENAI_API_KEY || false),
    },
  }
});
