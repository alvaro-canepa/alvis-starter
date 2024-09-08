import { useGlobalStore } from '@/store';
import { storeToRefs } from 'pinia';

import { useEventBus } from '@vueuse/core';
import dayjs from 'dayjs';
import { get } from 'lodash-es';

import axios from '@/plugins/axios';
import { i18n, loadLanguageAsync } from '@/plugins/i18n';

export default function () {
  const evLocaleAfterChange = useEventBus<string | undefined>(
    'locale.after.change'
  );
  const configModule = useGlobalStore();
  const { locale } = storeToRefs(useGlobalStore());

  const getLocales = async (): Promise<Record<string, any>[]> => {
    const obResponse = await axios.get('/lang/langs');

    return get(obResponse, 'data.data');
  };

  const setLocale = (sLocale?: string) => {
    if (!sLocale) {
      sLocale = getUserLocale();
    }

    configModule.setLocale(sLocale);

    void loadLanguageAsync(sLocale).then(() => {
      dayjs.locale(sLocale);

      // Emit event before locale has change
      evLocaleAfterChange.emit(sLocale);
    });
  };

  const getUserLocale = (): string => {
    const sProfile = localStorage.getItem('user');
    const obProfileData = sProfile ? JSON.parse(sProfile) : {};
    const sUserLocale = get(
      obProfileData,
      'property.lang',
      i18n.global.locale.value
    );

    return sUserLocale || 'es';
  };

  return {
    getLocales,
    setLocale,
    getUserLocale,
    locale,
  };
}
