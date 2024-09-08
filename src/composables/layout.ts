import { useLayoutStore } from '@/store';
import { storeToRefs } from 'pinia';

import { set } from 'lodash-es';

export default function () {
  const obRoute = useRoute();
  const layoutModule = useLayoutStore();
  const { layout } = storeToRefs(layoutModule);

  const layoutCss = computed(() => {
    const obCss: Record<string, boolean> = {};
    set(obCss, `layout-${layout.value}`, true);

    if (obRoute.name) {
      const sRouteName = obRoute.name.toString().replace('.', '-');
      set(obCss, `module-${sRouteName}`, true);
    }

    return obCss;
  });

  return { layoutCss, layoutModule };
}
