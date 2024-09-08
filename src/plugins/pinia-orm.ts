import { createPiniaOrmAxios } from '@pinia-orm/axios';
import { set } from 'lodash-es';
import { createORM } from 'pinia-orm';

// import axios from 'axios';
import config from '@/config';
import http from '@/plugins/axios';

const { API_ENDPOINT } = config;
const obHeaders: Record<string, any> = { 'Access-Control-Allow-Origin': '*' };

if (localStorage.getItem('at')) {
  set(obHeaders, 'Authorization', `Bearer ${localStorage.getItem('at')}`);
}

const piniaOrm = createORM();
// @ts-expect-error
piniaOrm().use(
  createPiniaOrmAxios({
    axios: http,
    baseURL: API_ENDPOINT,
    headers: obHeaders,
  })
);

export default piniaOrm;
