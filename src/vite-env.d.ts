/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_STORAGE_PREFIX: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
