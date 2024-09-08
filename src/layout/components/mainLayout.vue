<script setup lang="ts">

</script>

<template>
  <router-view v-slot="{ Component, route }">
    <v-slide-x-transition leave-absolute>
      <component :is="Component" :key="route.path" />
    </v-slide-x-transition>
  </router-view>
</template>
