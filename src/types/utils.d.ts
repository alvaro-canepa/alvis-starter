import type Auth from '@/orm/models/alvis/Auth';
import type { AxiosRepository } from '@pinia-orm/axios';
import type { AuthAxiosRepository } from '@planetadeleste/pinia-orm-auth';
import type { AxiosResponse } from 'axios';

export type fnCallback = (...args: any[]) => void;
export type AsyncFunction<T> = (...args: any[]) => Promise<T>;
export type Constructor<T> = new (...args: any[]) => T;
export type Predicate<T = boolean> =
  | ((...args: any[]) => T)
  | Record<string, any>
  | string;
export type Nullable<T> = T | null;

// used in src/components/form/FkForm.vue
export interface TabItem {
  label: string;
  component: any;
}

export interface NodeEventList {
  change?: string;
  selectItem?: string;
}

export interface AuthCsrfResponse {
  token: string;
}

export interface GlobalSize {
  width: number | string;
  height: number | string;
}

export type MobileBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type NextCodeModel =
  | 'product'
  | 'purchase_order'
  | 'customer'
  | 'category'
  | 'estimate'
  | 'brand';

export interface ModuleContainerProvider {
  showToolbar: fnCallback;
  hideToolbar: fnCallback;
  showSheet: fnCallback;
  hideSheet: fnCallback;
}
