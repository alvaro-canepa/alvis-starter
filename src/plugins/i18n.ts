import { createI18n } from 'vue-i18n';

import { locale } from 'dayjs';
import {
  assign,
  get,
  has,
  isEmpty,
  isFinite,
  isNil,
  isUndefined,
} from 'lodash-es';
import 'dayjs/locale/es';

import { useHelper } from '@/composables';
import axios from '@/plugins/axios';

const helper = useHelper();
const loadedLanguages: any[] = [];
const loadedMissing: Record<string, any> = {};

export const i18n = createI18n({
  legacy: false,
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  locale: 'es',
  fallbackLocale: 'en',
  numberFormats: {
    'es-UY': {
      currency: {
        style: 'currency',
        currency: 'UYU',
        notation: 'standard',
      },
    },
  },
  missing: (lang: string, message) => {
    message = helper.dotcase(message);

    if (isEmpty(message) || isFinite(Number(message)) || isNil(message)) {
      return message;
    }

    if (!has(loadedMissing, lang)) {
      assign(loadedMissing, { [lang]: {} });
    }

    const loadedMsgs = get(loadedMissing, lang);
    if (get(loadedMsgs, message)) {
      return message;
    } else {
      assign(loadedMsgs, { [message]: message });
      assign(loadedMissing, { [lang]: loadedMsgs });
    }

    void axios.post('/lang/tr', { message, lang }).then(response => {
      const sMessage = response.data.message;
      const msg =
        isUndefined(sMessage) || isEmpty(sMessage) ? message : sMessage;

      if (message !== msg && loadedLanguages.includes(lang)) {
        i18n.global.mergeLocaleMessage(lang, { [message]: msg });
      }

      return msg;
    });
  },
});

const setI18nLanguage = (lang: string): string => {
  // @ts-expect-error
  i18n.global.locale.value = lang;

  // Set axios headers language
  axios.defaults.headers.common['Accept-Language'] = lang;

  // Set HTML lang attribute
  const html = document.querySelector('html');
  if (html) {
    html.setAttribute('lang', lang);
  }

  // Set moment lang
  locale(lang);

  return lang;
};

export const loadLanguageAsync = async (lang: string): Promise<void> => {
  if (loadedLanguages.includes(lang)) {
    if (i18n.global.locale.value !== lang) setI18nLanguage(lang);
    await Promise.resolve();
    return;
  }

  await axios.get(`/lang/${lang}`).then(response => {
    const msgs = response.data;
    loadedLanguages.push(lang);
    i18n.global.setLocaleMessage(lang, msgs.messages);
    setI18nLanguage(lang);
  });
};
