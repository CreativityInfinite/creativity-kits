<template>
  <button
    class="rounded-lg px-3 py-2 text-xs ring-1 transition-colors bg-white text-gray-800 ring-black/10 hover:text-black dark:bg-bg-card dark:text-gray-300 dark:ring-white/10 dark:hover:text-white"
    @click="toggle"
    :title="`Theme: ${colorMode.value}`"
  >
    <Icon :icon="colorMode.value === 'dark' ? 'tabler:moon' : 'tabler:sun'" class="w-4 h-4" />
  </button>
</template>

<script setup lang="ts">
// @ts-nocheck
import { Icon } from '@iconify/vue';
import { useFancyThemeTransition } from '~/composables/useFancyThemeTransition';

const colorMode = useColorMode();
const { setModeWithTransition } = useFancyThemeTransition();

function toggle() {
  const next = colorMode.value === 'dark' ? 'light' : 'dark';
  setModeWithTransition(next);
}
</script>
