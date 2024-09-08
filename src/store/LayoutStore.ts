import { defineStore } from 'pinia';

type LayoutType = 'index' | 'main' | 'login';

interface LayoutState {
  _layout: LayoutType;
}

interface LayoutGetters {
  layout: LayoutType;
}

interface LayoutActions {
  setLayout: (sName: LayoutType) => void;
}

export default defineStore<
  'layout',
  LayoutState,
  // @ts-expect-error
  LayoutGetters,
  LayoutActions
>('layout', {
  state: (): LayoutState => ({
    _layout: 'index',
  }),

  actions: {
    setLayout(sName: LayoutType) {
      this._layout = sName;
    },
  },

  getters: {
    layout(s: LayoutState) {
      return s._layout;
    },
  },
});
