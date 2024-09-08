import { defineStore } from 'pinia';

import { useAxiosRepo } from '@pinia-orm/axios';
import { User } from '@planetadeleste/pinia-orm-alvis';
import { Auth } from '@planetadeleste/pinia-orm-auth';
import { useOrmModel } from '@planetadeleste/pinia-orm-core';
import { chain, get, has, isNil, isPlainObject, isString } from 'lodash-es';

import type { Role } from '@/router/permissions';
import type { UserData } from '@planetadeleste/pinia-orm-alvis';
import type { AuthApiAxiosRepository } from '@planetadeleste/pinia-orm-auth';


export interface AuthStatus {
  loggingIn: boolean;
  loggedIn: boolean;
}

const sProfile = localStorage.getItem('user');
const obProfileData: Partial<UserData> = sProfile ? JSON.parse(sProfile) : {};
const initStatus: AuthStatus = {
  loggingIn: false,
  loggedIn: has(obProfileData, 'id'),
};

interface StoreState {
  _user: UserData;
  _status: AuthStatus;
  _redirect: string | undefined;
  _csrf: string | undefined;
}

interface StoreGetters {
  isLogged: (s: StoreState) => boolean;
  user: (s: StoreState) => User;
  redirect: (s: StoreState) => string | undefined;
  csrf: (s: StoreState) => string | undefined;
  role: (s: StoreState) => Role | undefined;
}

interface StoreActions {
  loginRequest: (user: User) => void;
  loginSuccess: (user: User) => void;
  storeUser: (obUserData: Partial<UserData>) => void;
  logout: () => void;
  redirectTo: (path: string) => void;
  getCsrf: () => Promise<void>;
  reload: () => Promise<void>;
}

export default defineStore<
  'auth',
  StoreState,
  // @ts-expect-error
  StoreGetters,
  StoreActions
>('auth', {
  state: (): StoreState => ({
    _user: useOrmModel<User>(User).repo.make(obProfileData),
    _status: initStatus,
    _redirect: '',
    _csrf: undefined,
  }),

  getters: {
    isLogged(s: StoreState) {
      return s._status.loggedIn;
    },

    user(s: StoreState) {
      return s._user;
    },

    redirect(s: StoreState) {
      return s._redirect;
    },

    csrf(s: StoreState) {
      return s._csrf;
    },

    role(s: StoreState) {
      if (!isNil(s._user.role) && s._user.role !== 'guest') {

        return isString(s._user.role)
          ? s._user.role
          : get(s._user.role, 'code');
      }

      const sGroup =
        isPlainObject(s._user.groups) && has(s._user.groups, 'code')
          ? (get(s._user.groups, 'code', '') as string)
          : chain(s._user.groups)
              .map(obGroup => {
                if (isString(obGroup)) {
                  return obGroup;
                }

                return get(obGroup, 'code', '');
              })
              .filter(obGroup => obGroup !== 'guest')
              .first()
              .value();

      return sGroup;
    },
  },

  actions: {
    loginRequest(user: User): void {
      this._status.loggingIn = true;
      this._user = user;
    },

    loginSuccess(user: User): void {
      this._status.loggingIn = false;
      this._status.loggedIn = true;
      this._user = user;
    },

    async reload(): Promise<void> {
      if (!this._user.id) {
        return;
      }

      const obUser = await useOrmModel<User>(User).find(this._user.id);

      if (obUser) {
        this.storeUser(obUser.$toJson());
      }
    },

    storeUser(obUserData: UserData): void {
      this._user = useOrmModel<User>(User).repo.make(obUserData);
      const sUser = JSON.stringify(obUserData);
      localStorage.setItem('user', sUser);
    },

    logout(): void {
      this._status.loggingIn = false;
      this._status.loggedIn = false;
      this._user = new User();

      localStorage.removeItem('at');
      localStorage.removeItem('rt');
    },

    redirectTo(path: string): void {
      this._redirect = path;
    },

    async getCsrf() {
      const obAuthAxiosRepo = useAxiosRepo<Auth>(
        Auth
      ) as unknown as AuthApiAxiosRepository;
      const obResponse = await obAuthAxiosRepo.api().csrf();
      const { token } = obResponse.data.data;

      this._csrf = token;
    },
  },
});
