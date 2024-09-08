import { createPinia } from 'pinia';
import type { Pinia } from 'pinia';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Pinia Store
import piniaOrm from '@/plugins/pinia-orm';
import useAppStore from '@/store/AppStore';
import useAuthStore from '@/store/AuthStore';
import useCompanyStore from '@/store/CompanyStore';
import useGlobalStore from '@/store/GlobalStore';
import useLayoutStore from '@/store/LayoutStore';

/** Pinia Store */
const pinia: Pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

export {
  piniaOrm,
  useAppStore,
  useAuthStore,
  useCompanyStore,
  useGlobalStore,
  useLayoutStore,
};
