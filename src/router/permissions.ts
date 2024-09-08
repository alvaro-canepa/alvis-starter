import { castArray, forEach } from 'lodash-es';

export type Role = 'admin' | 'customer' | 'company' | 'guest' | 'registered';
const arRoles: Role[] = ['admin', 'company', 'guest'];
export interface PermissionRole {
  role: Role;
  access: boolean;
  redirect?: string;
}

export const setRole = (sValue: Role | Role[]) => {
  const arPermissions: PermissionRole[] = [];
  const arRoleList = castArray(sValue);
  forEach(arRoles, sRole => {
    const obRole = {
      role: sRole,
      access: arRoleList.includes(sRole) || sRole === 'admin',
      redirect: 'error.404',
    };

    arPermissions.push(obRole);
  });

  return arPermissions;
};
