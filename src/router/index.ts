import { useAppStore, useGlobalStore } from '@/store';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

import { useEventBus } from '@vueuse/core';
import { get, map } from 'lodash-es';
import { setupLayouts } from 'virtual:generated-layouts';
import { routes } from 'vue-router/auto-routes';

import type { Role } from '@/router/permissions';

import { i18n, loadLanguageAsync } from '@/plugins/i18n';
import { setRole } from '@/router/permissions';


/** Router Rules */
const evAppRoutesReady = useEventBus('app.routes.ready');

const mapRoute = (route: RouteRecordRaw) => {
  const obMeta = route.meta ?? {};

  if (obMeta.role) {
    obMeta.permissions = setRole(obMeta.role as Role);
    delete obMeta.role;
  }

  if (!obMeta.title) {
    obMeta.title = route.name;
  }

  route.meta = obMeta;

  if (route.children) {
    route.children = map(route.children, mapRoute);
  }

  return route;
};
/** Vue Router */
const router = createRouter({
  routes: map(setupLayouts(routes), mapRoute),
  history: createWebHistory('/app/'),
});

void router.isReady().then(() => {
  evAppRoutesReady.emit();
});

router.beforeEach(async (_to, _from, next) => {
  const globalStore = useGlobalStore();
  const appModule = useAppStore();

  // Show Loading
  globalStore.setLoading(true);

  if (appModule.routesReady) {
    const lang = get(_to.params, 'lang') ?? i18n.global.locale.value;
    if (lang) {
      await loadLanguageAsync(lang as string).then(() => next());
      return;
    }
  }

  next();
});

router.afterEach(() => {
  const globalStore = useGlobalStore();

  // Hide Loading
  globalStore.loaded();
});

export default router;
