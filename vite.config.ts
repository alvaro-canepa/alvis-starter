import { writeFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, type UserConfig } from 'vite';

import { map, trim } from 'lodash-es';
import { visualizer } from 'rollup-plugin-visualizer';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Components from 'unplugin-vue-components/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import VueRouter from 'unplugin-vue-router/vite';
import { checker } from 'vite-plugin-checker';
import { ClientSideLayout } from 'vite-plugin-vue-layouts';
import svgLoader from 'vite-svg-loader';

import { iconsPlugin } from './config/iconsPlugin';
import pkg from './package.json';

const arIconsCollection = ['lineicons', 'feather', 'ionicons', 'logos'];
const iconsResolver = IconsResolver({
  prefix: 'icon',
  enabledCollections: arIconsCollection,
  customCollections: arIconsCollection,
});

/**
 * Vite Configure
 *
 * @see {@link https://vitejs.dev/config/}
 */
export default defineConfig(({ command, mode }): UserConfig => {
  const config: UserConfig = {
    // https://vitejs.dev/config/shared-options.html#base
    base: './',
    // https://vitejs.dev/config/shared-options.html#define
    define: { 'process.env': {} },
    plugins: [
      // Vue Router
      VueRouter({
        routesFolder: 'src/modules',
        exclude: ['**/components/**/*', '**/views/*'],
        getRouteName: route => {
          const sPath = trim(route.fullPath, '/');
          let arPathParts = sPath.split('/');
          arPathParts = map(arPathParts, sPart => {
            if (sPart.includes(':')) {
              sPart = sPart.replace(/:.*$/, '');
            }

            return sPart;
          });
          return trim(arPathParts.join('.'), '.');
        },
      }),

      // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
      ClientSideLayout({
        layoutDir: 'src/layout',
        defaultLayout: 'index',
      }),

      // Vue3
      vue(),

      // vite-plugin-checker
      // https://github.com/fi3ework/vite-plugin-checker
      checker({
        typescript: true,
        // vueTsc: true,
        // eslint: { lintCommand: 'eslint' },
        // stylelint: { lintCommand: 'stylelint' },
      }),

      // SVG Loader
      svgLoader(),

      // autogenerate components.d.ts
      Components({
        dts: true,
        resolvers: [iconsResolver],
      }),

      AutoImport({
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
        ],

        imports: [
          // presets
          'vue',
          {
            '@vueuse/core': ['useVModel'],
            // '@vueuse/integrations/useChangeCase': ['useChangeCase'],
            // '@casl/vue': ['useAbility'],
          },
          VueRouterAutoImports,
        ],

        dts: './auto-imports.d.ts',

        eslintrc: {
          enabled: true, // Default `false`
          filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },

        resolvers: [iconsResolver],
      }),

      iconsPlugin(arIconsCollection),
    ],

    // https://vitejs.dev/config/server-options.html
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..'],
      },
      proxy: {
        '^/api': {
          target: 'https://alvis.app',
          ws: false,
          changeOrigin: true,
          secure: false,
        },
        '^/storage': {
          target: 'https://alvis.app',
          ws: false,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Resolver
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },

    // Build Options
    // https://vitejs.dev/config/build-options.html
    build: {
      outDir: `./dist/`,
      assetsDir: `resources/views/alvis/${pkg.version}/assets`,

      // Build Target
      // https://vitejs.dev/config/build-options.html#build-target
      target: 'esnext',

      // Minify option
      // https://vitejs.dev/config/build-options.html#build-minify
      minify: 'terser',

      // Rollup Options
      // https://vitejs.dev/config/build-options.html#build-rollupoptions
      rollupOptions: {
        output: {
          manualChunks: {
            // Split external library from transpiled code.
            vue: ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
          },
          plugins: [
            mode === 'analyze'
              ? // rollup-plugin-visualizer
                // https://github.com/btd/rollup-plugin-visualizer
                visualizer({
                  open: true,
                  filename: 'dist/stats.html',
                })
              : undefined,
          ],
        },
      },

      terserOptions: {
        compress: {
          drop_console: true,
          keep_classnames: true,
          pure_funcs: ['console.warn', 'console.error'],
        },
        keep_classnames: true,
      },
    },

    esbuild: {
      // Drop console when production build.
      drop: command === 'serve' ? [] : ['console'],
    },
  };

  // Write meta data.
  writeFileSync(
    fileURLToPath(new URL('./src/Meta.ts', import.meta.url)),

    `import type MetaInterface from '@/interfaces/MetaInterface';

// This file is auto-generated by the build system.
const meta: MetaInterface = {
  version: '${pkg.version}',
  date: '${new Date().toISOString()}',
};
export default meta;
`
  );

  return config;
});
