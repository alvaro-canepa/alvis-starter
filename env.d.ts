/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
/// <reference types="vite/client" />
/// <reference types="vitest" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="uvite-plugin-vue-layouts/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  // see https://vitejs.dev/guide/env-and-mode.html#env-files
  // add .env variables.
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
