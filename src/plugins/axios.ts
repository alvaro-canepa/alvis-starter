import { useAuthStore, useCompanyStore } from '@/store';
import { storeToRefs } from 'pinia';

import axios from 'axios';
import {
  get,
  has,
  indexOf,
  isEmpty,
  isNil,
  isObject,
  isUndefined,
  set,
  startsWith,
} from 'lodash-es';

import type { AxiosRequestConfig } from 'axios';

import { useFlash } from '@/composables';
import config from '@/config';

const { API_ENDPOINT } = config;
const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
let PENDING_REQUESTS = 0;
const http = axios.create({ baseURL: API_ENDPOINT });
const { error: flashError } = useFlash();

http.defaults.baseURL = API_ENDPOINT;
set(http.defaults.headers.common, 'Access-Control-Allow-Origin', '*');

// Setup axios request and limit concurrency requests to MAX_REQUEST_COUNT
http.interceptors.request.use(
  async (reqConfig: AxiosRequestConfig) => {
    return await new Promise(resolve => {
      const interval = setInterval(() => {
        if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
          PENDING_REQUESTS++;
          clearInterval(interval);
          // @ts-expect-error
          resolve(configRequest(reqConfig));
        }
      }, INTERVAL_MS);
    });
  },
  async error => {
    console.error(error);
    return await Promise.reject(error);
  }
);

const forceLogout = () => {
  useAuthStore().logout();
};

http.interceptors.response.use(
  async reqConfig => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);

    return reqConfig;
  },

  async error => {
    const data = get(error, 'response.data') as Record<string, any>;
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);

    console.error(error);

    if (isObject(error.response.config)) {
      const url = get(error, 'response.config.url');

      if (
        url.includes('/login') ||
        url.includes('/refresh') ||
        url.includes('/invalidate')
      ) {
        if (flashDataError(data)) {
          error = data;
        }

        return await Promise.reject(error);
      }
    }

    if (indexOf([400, 401], error.response.status) !== -1) {
      forceLogout();
    }

    if (flashDataError(data)) {
      error = data;
    }

    return await Promise.reject(error);
  }
);

const flashDataError: (data: Record<string, any>) => boolean = (
  data: Record<string, any>
) => {
  if (isEmpty(data)) {
    return false;
  }

  if (has(data, 'error') || has(data, 'message')) {
    const sMessage: string | undefined | null = data.error || data.message;
    if (isNil(sMessage) || isEmpty(sMessage)) {
      return false;
    }

    flashError(sMessage);

    return true;
  }

  return false;
};

const configRequest = (reqConfig: AxiosRequestConfig) => {
  if (!reqConfig || isUndefined(reqConfig.url)) {
    return reqConfig;
  }

  // clean the url
  if (startsWith(reqConfig.url, API_ENDPOINT)) {
    const url = reqConfig.url.replace(API_ENDPOINT, '');
    set(reqConfig, 'url', url);
  }

  // Add Headers
  if (startsWith(reqConfig.baseURL, API_ENDPOINT)) {
    setHeaders(reqConfig);
  }

  return reqConfig;
};

export const setHeaders = (reqConfig: AxiosRequestConfig) => {
  const { companyId, officeId } = storeToRefs(useCompanyStore());
  const { csrf } = storeToRefs(useAuthStore());

  // Add Bearer auth
  if (localStorage.getItem('at')) {
    set(
      reqConfig,
      'headers.Authorization',
      `Bearer ${localStorage.getItem('at')}`
    );
  }

  // Add refresh token
  if (reqConfig?.url?.includes('/auth/logout')) {
    set(reqConfig, 'headers.X-REFRESH-TOKEN', localStorage.getItem('rt'));
  }

  // Add company/office
  set(reqConfig, 'headers.X-AV-CID', companyId?.value);
  set(reqConfig, 'headers.X-AV-OID', officeId?.value);

  // Add CSRF TOKEN
  set(reqConfig, 'headers.X-CSRF-TOKEN', csrf.value ?? '');
  set(reqConfig, 'headers.X-ENV', 'backend');
};

export default http;
