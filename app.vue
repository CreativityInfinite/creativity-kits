<template>
  <!-- 使用 ColorScheme 让 color-mode 确保类名正确注入 -->
  <ColorScheme tag="div" class="min-h-screen min-h-svh md:min-h-dvh overflow-x-hidden bg-white text-gray-900 transition-colors dark:bg-bg dark:text-white">
    <NuxtLoadingIndicator color="#7c3aed" />
    <div class="fixed right-4 top-4 z-50 flex gap-2" v-show="!headerSwitchesHidden">
      <ThemeToggle />
      <ThemeStyleSwitch />
      <LangSwitch />
    </div>
    <NuxtPage />
  </ColorScheme>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useState } from 'nuxt/app'
const { t } = useI18n()
const headerSwitchesHidden = useState('headerSwitchesHidden', () => false)
</script>

<style>
html,
body,
#__nuxt {
  height: 100%;
}
</style>
