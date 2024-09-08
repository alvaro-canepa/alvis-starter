import { useAuthStore, useLayoutStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useAxiosRepo } from '@pinia-orm/axios';
import { User } from '@planetadeleste/pinia-orm-alvis';
import { Auth } from '@planetadeleste/pinia-orm-auth';
import dayjs from 'dayjs';
import { delay, find, get, has } from 'lodash-es';

import useFlash from './flash';

import type { PermissionRole } from '@/router/permissions';
import type {
  AuthApiAxiosRepository,
  ResponseLoginRegisterData,
} from '@planetadeleste/pinia-orm-auth';
import type { RouteNamedMap } from 'vue-router/auto-routes';

/**
 * Auth service
 */
export default function () {
  const auth = useAuthStore();
  const { setLayout } = useLayoutStore();
  const flash = useFlash();
  const { t } = useI18n();
  const $route = useRoute();
  const $router = useRouter();
  // @ts-expect-error
  const obAuthAxiosRepo = useAxiosRepo<Auth>(Auth) as AuthApiAxiosRepository;
  const { user, role } = storeToRefs(auth);

  const isLogged = computed(() => {
    return auth.isLogged && role && role.value !== 'guest';
  });

  /**
   * Enter to the platform by user login auth
   */
  const logIn = async (
    login: string,
    password: string
  ): Promise<ResponseLoginRegisterData | boolean> => {
    // Reset auth store vars
    auth.logout();

    const obResponse = await obAuthAxiosRepo
      .api()
      .login(login, password)
      .then(res => res.data)
      .catch(reason => {
        console.error(reason);
      });

    if (!obResponse || !obResponse.status) {
      let sError: string | null = get(obResponse, 'message', null);

      if (!sError || sError === 'invalid_credentials') {
        sError = t('invalid_credentials');
      }

      flash.error(sError);
      return false;
    }

    return await authenticate(obResponse.data);
  };

  /**
   * Send registration request
   */
  const register = async (
    params: Record<string, any>
  ): Promise<false | ResponseLoginRegisterData> => {
    const obResponse = await obAuthAxiosRepo.api().register(params);

    if (!obResponse || has(obResponse, 'error')) {
      let msg = 'Ha habido un problema al registrar tu cuenta';
      msg = get(obResponse, 'error', msg) as string;
      flash.error(msg);

      throw new Error(msg);
    }

    const obData = obResponse.data;

    if (!obData.status) {
      if (obData.message) {
        flash.error(obData.message);
      }

      throw new Error(obData.message ?? 'unknown error');
    }

    return await authenticate(obData.data);
  };

  /**
   * Exit from platform and clear user login data
   */
  const logOut = async (): Promise<void> => {
    try {
      await obAuthAxiosRepo.api().logout();
    } catch (e) {
      console.error(e);
    } finally {
      auth.logout();
      setLayout('login');
      await $router.push({ name: 'login' });
    }
  };

  /**
   * Collect login data and set app token
   */
  const authenticate = async (
    data: ResponseLoginRegisterData
  ): Promise<ResponseLoginRegisterData> => {
    if (!data.token || !data.expires_in) {
      return data;
    }

    localStorage.setItem('at', data.token);
    localStorage.setItem('rt', data.token);

    const tokensExpiry = dayjs(data.expires_in).toISOString();
    localStorage.setItem('expires_in', tokensExpiry);

    if (data.user) {
      const sUser = JSON.stringify(data.user);
      localStorage.setItem('user', sUser);

      const obUser = new User(data.user);
      auth.loginSuccess(obUser);
    }

    return data;
  };

  /**
   * Initializes the user session
   * Checks if the user is already logged in and refreshes their token if needed.
   * Also sets the layout depending on auth status.
   *
   * @returns Promise resolving when session init is complete
   */
  const initSession = async (): Promise<unknown> => {
    if (isLogged.value) {
      const tokenExpiryDate = localStorage.getItem('expires_in');

      if (!tokenExpiryDate) {
        await logOut();
        return;
      }

      const tenMinutesBeforeExpiry = dayjs(tokenExpiryDate).subtract(10, 'm');

      if (dayjs().isAfter(tenMinutesBeforeExpiry)) {
        await logOut();
        return;
      }

      delay(refreshAccessToken, tenMinutesBeforeExpiry.diff(dayjs()));

      if ($route.name !== 'home') {
        await $router.push({ name: 'home' });
      }

      setLayout('main');
    } else {
      setLayout('login');
    }
  };

  /**
   * Get new access token
   */
  const refreshAccessToken = async (): Promise<string | undefined> => {
    const response = await obAuthAxiosRepo.api().refresh();
    const obResponse = response.data;

    if (!obResponse?.status) {
      await logOut();
      return;
    }

    if (has(obResponse, 'data.token')) {
      await authenticate(obResponse.data);

      const tokenExpiryDate = localStorage.getItem('expires_in');
      if (!tokenExpiryDate) {
        return;
      }

      const tenMinutesBeforeExpiry = dayjs(tokenExpiryDate).subtract(10, 'm');

      delay(refreshAccessToken, tenMinutesBeforeExpiry.diff(dayjs()));
    }

    return obResponse.data.token;
  };

  /*
  const reloadUserAvatar = async (reloadData = false): Promise<void> => {
    if (!user?.value || !isLogged.value) {
      throw new Error('No se ha iniciado sesión');
    }
    reloadData ? await user.value.reload() : await user.value.loadAvatar();
  };
*/

  /**
   * Checks authentication status
   * @returns {Promise<boolean>} Promise resolving to authentication status
   */
  const authCheck = async (): Promise<boolean> => {
    let bLogged = false;

    try {
      const response = await obAuthAxiosRepo.api().check();
      bLogged = get(response.data, 'status', false);
    } catch (error) {
      return bLogged;
    }

    return bLogged;
  };

  /**
   * Return current user route access validation
   * @returns {Boolean}
   */
  const hasRouteAccess = (sName?: keyof RouteNamedMap | null): boolean => {
    if (!sName && !!$route.name) {
      sName = $route.name as keyof RouteNamedMap;
    }

    if (sName) {
      const obRoute = $router.resolve({ name: sName as keyof RouteNamedMap });
      const arMetaPerms = get(obRoute, 'meta.permissions') as PermissionRole[];
      if (arMetaPerms?.length) {
        const obPermission = find(arMetaPerms, { role: role.value });
        return obPermission ? obPermission.access : false;
      }
    }

    return false;
  };

  return {
    authCheck,
    authenticate,
    hasRouteAccess,
    initSession,
    isLogged,
    logIn,
    logOut,
    register,
    user,
  };
}
