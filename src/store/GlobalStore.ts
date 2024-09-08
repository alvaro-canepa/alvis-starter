import { defineStore } from 'pinia';

/** Global state */
interface GlobalState {
  /**  Loading overlay */
  _loading: boolean;
  /** ProgressBar Percentage */
  _progress: number | null;
  /** SnackBar Text */
  _message: string | null;
  /** Language */
  _locale: string;
}

interface GlobalGetters {
  /** Loading overlay visibility */
  loading: boolean;
  /** Loadig progress value */
  progress: number | null;
  /** Snackbar Text (Unused) */
  message: string | null;
  locale: string;
}

interface GlobalActions {
  /** Show loading Overlay */
  setLoading: (display: boolean) => void;
  /** Hide loading overlay */
  loaded: () => void;
  /** Update progress value */
  setProgress: (progress: number | null) => void;
  /** Show snackbar message */
  setMessage: (message: string) => void;
  setLocale: (locale: string) => void;
}

/** Global Store */
export default defineStore<
  'global',
  GlobalState,
  // @ts-expect-error
  GlobalGetters,
  GlobalActions>(
  'global',
  {
    // Default Global State
    state: (): GlobalState => ({
      _loading: false,
      _progress: null,
      _message: null,
      _locale: window.navigator.languages?.[0] || window.navigator.language,
    }),

    // Getters
    getters: {
      /** Loading overlay visibility */
      loading(s: GlobalState): boolean {
        return s._loading;
      },
      /** Loadig progress value */
      progress(s: GlobalState): number | null {
        s._loading = true;
        return s._progress;
      },
      /** Snackbar Text (Unused) */
      message(s: GlobalState): string | null {
        return s._message;
      },

      locale(s: GlobalState): string {
        return s._locale;
      },
    },
    // Actions
    actions: {
      /** Show loading Overlay */
      setLoading(display: boolean) {
        this._loading = display;
      },

      /** Hide loading overlay */
      loaded() {
        this._loading = false;
        this._progress = null;
      },

      /** Update progress value */
      setProgress(progress: number | null) {
        // update progress value
        this._progress = progress;
        // display loading overlay
        this._loading = true;
      },
      /** Show snackbar message */
      setMessage(message: string) {
        // put snackbar text
        this._message = message;
      },

      /**
       * Set locale
       * @date 25/9/2022 - 07:53:25
       * @author Planeta del Este
       *
       * @param {string} locale
       */
      setLocale(locale: string) {
        this._locale = locale;
      },
    },
  }
);
