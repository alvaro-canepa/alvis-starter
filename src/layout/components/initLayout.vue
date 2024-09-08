<script setup lang="ts">
import { useAppStore, useAuthStore, useCompanyStore, useLayoutStore } from '@/store';
import { storeToRefs } from 'pinia';

import { useLocale } from '@/composables';

const { getCsrf } = useAuthStore();
const appModule = useAppStore();
const { setLayout } = useLayoutStore();
const { setLocale } = useLocale();
const { company } = storeToRefs(useCompanyStore());
const { setCompany } = useCompanyStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  setLocale();
  await onPreload();
});

const onPreload = async () => {
  appModule.routesDone();
  await getCsrf();

  try {
    await appModule.loadGroups();

    if (localStorage.getItem('cid') && !company?.value) {
      await setCompany(localStorage.getItem('cid') as string | number);
    }

    setLayout('main');
  } catch (error) {
    console.error(error);
  }
};
</script>

