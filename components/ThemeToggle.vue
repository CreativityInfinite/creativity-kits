<template>
  <button
    class="rounded-lg px-3 py-2 text-xs ring-1 transition-colors bg-white text-gray-800 ring-black/10 hover:text-black dark:bg-bg-card dark:text-gray-300 dark:ring-white/10 dark:hover:text-white"
    @click="toggle"
    :title="`Theme: ${colorMode.value}`"
  >
    {{ colorMode.value === 'dark' ? '🌙' : '☀️' }}
  </button>
</template>

<script setup lang="ts">
// @ts-nocheck
const colorMode = useColorMode()
function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
