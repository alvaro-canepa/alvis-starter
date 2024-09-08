import { defineStore } from 'pinia';

import type { Item } from 'pinia-orm';

import { Company, Office } from '@planetadeleste/pinia-orm-alvis';
import { useOrmModel } from '@planetadeleste/pinia-orm-core';

interface StoreState {
  _companyId?: string;
  _company?: Item<Company>;
  _officeId?: string;
  _office?: Item<Office>;
}

interface StoreGetters {
  companyId?: string;
  company?: Item<Company>;
  officeId?: string;
  office?: Item<Office>;
}

interface StoreActions {
  setCompany: (id: number | string) => Promise<void>;
  reloadCompany: () => Promise<void>;
  setOffice: (id: number | string) => Promise<void>;
}

// @ts-expect-error
export default defineStore<'company', StoreState, StoreGetters, StoreActions>(
  'company',
  {
    state: (): StoreState => ({
      _companyId: undefined,
      _company: undefined,
      _officeId: undefined,
      _office: undefined,
    }),

    getters: {
      companyId: (s: StoreState) => s._companyId,
      company: (s: StoreState) => s._company,
      officeId: (s: StoreState) => s._officeId,
      office: (s: StoreState) => s._office,
    },

    actions: {
      async setCompany(id: number | string) {
        const { repo } = useOrmModel<Company>(Company);
        this._company = repo.withAll().find(id);
        this._companyId = this._company
          ? (this._company.id as string)
          : undefined;

        if (this._companyId) {
          localStorage.setItem('cid', this._companyId);
        }

        if (this._company?.office) {
          await this.setOffice(this._company.office.id);
        }
      },

      async reloadCompany() {
        if (!this._companyId) {
          return;
        }

        const { find } = useOrmModel<Company>(Company);

        await find(this._companyId);
        await this.setCompany(this._companyId);
      },

      async setOffice(id?: number | string) {
        if (!this._companyId) {
          return;
        }

        const { repo } = useOrmModel<Office>(Office);
        const obModel = id
          ? repo.withAll().find(id)
          : repo.where('company_id', this._companyId).withAll().first();

        this._office = obModel;
        this._officeId = obModel ? (obModel.id as string) : undefined;

        if (this._officeId) {
          localStorage.setItem('oid', this._officeId);
        }
      },
    },
  }
);
