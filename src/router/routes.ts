import type { FunctionalComponent, SVGAttributes } from 'vue';
import type {
  RouteComponent,
  RouteMeta,
  RouteRecordNormalized,
} from 'vue-router';

import type { PermissionRole } from './permissions';
import type { AsyncFunction } from '@/types/utils';


export interface RouteConfigIcon {
  icon: string;
  original: boolean;
}

export interface RouteConfigBreadcrumb {
  label: string;
  parent: string;
}

export interface RouteConfigMetaLocal extends RouteMeta {
  sortOrder?: number;
  module?: string;
  title?: string;
  group?: string;
  drawer?: boolean;
  main?: boolean;
  addChildren?: boolean;
  iconComponent?: boolean;
  iconProps?: RouteConfigIcon;
  icon?: AsyncFunction<ImportedModule<FunctionalComponent<SVGAttributes>>>;
  // | FunctionalComponent<SVGAttributes>
  breadcrumb?: Record<string, any>;
  permissions?: PermissionRole[];
}

export interface RouteRecordNormalizedLocal extends RouteRecordNormalized {
  page?: string;
  alias?: string | string[];
  caseSensitive?: boolean;
  component?: RouteComponent;
  meta: RouteConfigMetaLocal;
}

export type RouteConfigLocal = RouteRecordNormalizedLocal;

export interface ImportedModule<T> {
  default: T;
}
