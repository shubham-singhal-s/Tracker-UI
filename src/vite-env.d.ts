/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_LOCAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
