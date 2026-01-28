/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_TRANSLATION_BACKEND_URL: string;
  readonly VITE_TRANSLATION_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}