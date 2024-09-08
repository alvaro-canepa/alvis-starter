import type { RouteConfigLocal } from '@/router/routes';
import type { RouteNamedMap } from 'vue-router/auto-routes';

export interface MenuItem {
  title: string;
  to?: keyof RouteNamedMap;
  key?: string;
  children?: MenuItem[];
  route?: RouteConfigLocal;
}

const arMenuItems: MenuItem[] = [
  { title: 'home', to: 'home' },
];

export default arMenuItems;
