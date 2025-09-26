<template>
  <div class="flex items-center gap-2 text-xs">
    <span class="text-[11px] text-gray-500 dark:text-gray-400">Dark</span>
    <UiSwitch v-model="isDark" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiSwitch from '~/components/ui/Switch.vue'
import { useThemePalette } from '~/composables/useThemePalette'

const { mode, setMode } = useThemePalette()
const isDark = computed({
  get: () => mode.value === 'dark',
  set: (v: boolean) => setMode(v ? 'dark' : 'light')
})
</script>
