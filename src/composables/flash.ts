import {
  type NotificationClearMethods,
  push,
  type PushPromiseReturn,
} from 'notivue';

/**
 * Toast messages manager
 */
export default function () {
  const notify = ref<NotificationClearMethods | undefined>();
  const notifyPromise = ref<
    (NotificationClearMethods & PushPromiseReturn) | undefined
  >();

  // const configDefault = () => {
  //   updateConfig({ position: 'top-center' });
  // };

  const success = (message: string): void => {
    notify.value = push.success({ title: message });
  };

  const info = (message: string): void => {
    notify.value = push.info({ title: message });
  };

  const error = (message: string): void => {
    notify.value = push.error({ title: message });
  };

  const loading = (message: string = 'loading.please.wait') => {
    // updateConfig({ position: 'bottom-right' });
    notifyPromise.value = push.promise({
      message,
      props: { loading: true },
    });
  };

  const loaded = (message?: string) => {
    if (!notifyPromise.value) {
      return;
    }

    if (message) {
      notifyPromise.value.resolve(message);
    } else {
      notifyPromise.value.clear();
    }
  };

  const clear = () => {
    if (!notify.value) {
      return;
    }

    notify.value.clear();
  };

  const clearAll = () => {
    push.clearAll();
  };

  return { success, error, info, clear, clearAll, loading, loaded };
}
