<script setup lang="ts">
import { useLayoutStore } from '@/store';
import { storeToRefs } from 'pinia';

import { get } from 'lodash-es';

const { layout } = storeToRefs(useLayoutStore());
const layoutList: Record<string, any> = {
  index: defineAsyncComponent(
    async () => await import('@/layout/components/initLayout.vue')
  ),
  main: defineAsyncComponent(
    async () => await import('@/layout/components/mainLayout.vue')
  ),
};
const sLayoutComp = computed(() => {
  return get(layoutList, layout.value);
});
</script>

<template>
  <component :is="sLayoutComp" />
</template>
