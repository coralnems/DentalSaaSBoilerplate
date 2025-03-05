/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENCRYPTION_KEY: string;
  readonly VITE_REDIS_HOST: string;
  readonly VITE_REDIS_PORT: string;
  readonly VITE_REDIS_PASSWORD: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 