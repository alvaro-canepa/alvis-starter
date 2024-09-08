import { defineStore } from 'pinia';

import { Group } from '@planetadeleste/pinia-orm-auth';
import { useOrmModel } from '@planetadeleste/pinia-orm-core';
import { Country, State, Town } from '@planetadeleste/pinia-orm-location';
import { Category } from '@planetadeleste/pinia-orm-shopaholic';
import { find, forEach, map } from 'lodash-es';

import type { CategoryAxiosRepository } from '@planetadeleste/pinia-orm-shopaholic';

interface StoreState {
  _categories: Category[];
  _groups: Group[];
  _countries: Country[];
  _states: State[];
  _towns: Town[];
  _mainDrawer: boolean;
  _rightDrawer: boolean;
  _routesReady: boolean;
}

type AppDrawer = 'main' | 'right';

interface StoreGetters {
  categories: Category[];
  groups: Group[];
  roles: string[];
  countries: Country[];
  defaultCountry: Country | undefined;
  states: State[];
  defaultState: State | undefined;
  towns: Town[];
  routesReady: boolean;
  mainDrawer: boolean;
  rightDrawer: boolean;
}

interface StoreActions {
  loadCategories: () => Promise<void>;
  loadGroups: () => Promise<void>;
  loadCountries: () => Promise<void>;
  loadStates: (iCountryID?: number) => Promise<void>;
  loadTowns: (iStateID?: number) => Promise<void>;
  routesDone: () => void;
  routesNotReady: () => void;
  setDrawer: (bValue: boolean, sDrawer?: AppDrawer) => void;
  toggleMainDrawer: () => void;
  openDrawer: (sValue: AppDrawer) => void;
  closeDrawer: (sValue: AppDrawer) => void;
}

export default defineStore<
  'app',
  StoreState,
  // @ts-expect-error
  StoreGetters,
  StoreActions
>('app', {
  state: (): StoreState => ({
    _categories: [],
    _groups: [],
    _countries: [],
    _states: [],
    _towns: [],
    _mainDrawer: true,
    _rightDrawer: false,
    _routesReady: false,
  }),

  getters: {
    categories(s: StoreState) {
      return s._categories;
    },

    groups(s: StoreState) {
      return s._groups;
    },

    roles(s: StoreState): string[] {
      return map(s._groups, 'code') as string[];
    },

    countries(s: StoreState) {
      return s._countries;
    },

    defaultCountry(s: StoreState): Country | undefined {
      return find(s._countries, { is_default: true });
    },

    states(s: StoreState) {
      return s._states;
    },

    defaultState(s: StoreState): State | undefined {
      return find(s._states, { is_default: true });
    },

    towns(s: StoreState) {
      return s._towns;
    },

    routesReady(s: StoreState): boolean {
      return s._routesReady;
    },

    mainDrawer(s: StoreState): boolean {
      return s._mainDrawer;
    },

    rightDrawer(s: StoreState): boolean {
      return s._rightDrawer;
    },
  },

  actions: {
    async loadCategories() {
      const obRepo = useOrmModel<Category, CategoryAxiosRepository>(Category);
      await obRepo.repoAxios.tree();
      this._categories = obRepo.repo.withAll().all();
    },

    async loadGroups() {
      const obRepo = useOrmModel<Group>(Group);
      const obModels = await obRepo.get();
      this._groups = obModels ?? [];
    },

    async loadCountries() {
      const obRepo = useOrmModel<Country>(Country);
      obRepo.filterBy({ active: 1 });
      const obModels = await obRepo.get();
      this._countries = obModels ?? [];
    },

    async loadStates(iCountryID?: number) {
      const obCountryRepo = useOrmModel<Country>(Country);
      const obCountry = iCountryID
        ? await obCountryRepo.find(iCountryID)
        : this.defaultCountry;

      this._states = [];

      if (obCountry) {
        if (obCountry.states.length) {
          forEach(obCountry.states, obState => {
            if (!find(this._states, { id: obState.id })) {
              this._states.push(obState as State);
            }
          });
        } else {
          const obRepo = useOrmModel<State>(State);
          obRepo.filterBy({ active: 1, country: obCountry.id });
          const obModels = await obRepo.get();
          this._states = obModels ?? [];
        }
      }
    },

    async loadTowns(iStateID?: number) {
      const obStateRepo = useOrmModel<State>(State);
      const obState = iStateID
        ? await obStateRepo.find(iStateID)
        : this.defaultState;

      if (obState) {
        if (obState.towns.length) {
          this._towns = obState.towns as Town[];
        } else {
          const obRepo = useOrmModel<Town>(Town);
          obRepo.filterBy({ active: 1, state: obState.id });
          const obModels = await obRepo.get();
          this._towns = obModels ?? [];
        }
      }
    },

    routesDone() {
      this._routesReady = true;
    },

    routesNotReady() {
      this._routesReady = false;
    },

    setDrawer(bValue: boolean, sDrawer: AppDrawer = 'main') {
      if (sDrawer === 'main') {
        this._mainDrawer = bValue;
      } else if (sDrawer === 'right') {
        this._rightDrawer = bValue;
      }
    },

    toggleMainDrawer() {
      this._mainDrawer = !this._mainDrawer;
    },

    openDrawer(sValue: AppDrawer) {
      this.setDrawer(true, sValue);
    },

    closeDrawer(sValue: AppDrawer) {
      this.setDrawer(false, sValue);
    },
  },
});
