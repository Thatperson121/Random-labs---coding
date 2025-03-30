/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_STORAGE_PREFIX: string;
  readonly VITE_ENABLE_COLLABORATION: string;
  readonly VITE_ENABLE_AI_ASSISTANT: string;
  readonly VITE_ENABLE_CODE_EXECUTION: string;
  readonly VITE_MAX_EXECUTION_TIME: string;
  readonly VITE_ALLOWED_ORIGINS: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 