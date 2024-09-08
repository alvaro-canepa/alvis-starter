/**
 * Vue3 Main script
 */

import store from '@/store';
import { createApp } from 'vue';

import VueAxios from 'vue-axios';

import App from './App.vue';

import http from '@/plugins/axios';
import { i18n } from '@/plugins/i18n';
import notivue from '@/plugins/notivue';
import router from '@/router';
import '@/plugins/yup';
import '@/plugins/dayjs';
import '@/assets/main.css';

/** Register Vue */
const vue = createApp(App);
vue.use(store)
  .use(router)
  .use(notivue)
  // @ts-expect-error
  .use(VueAxios, http)
  .use(i18n)
;

// Run!
router
  .isReady()
  .then(() => vue.mount('#app'))
  .catch(e => console.error(e));
