<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.markdown-editor.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.markdown-editor.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.markdown-editor.page.leftLabel') }}</div>
        <textarea v-model="md" rows="16" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
        <div class="flex justify-center gap-3 mt-3">
          <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">{{ $t('tools.markdown-editor.page.copy') }}</button>
          <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.markdown-editor.page.clear') }}</button>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.markdown-editor.page.preview') }}</div>
        <div v-html="html" class="prose prose-sm dark:prose-invert max-w-none"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const md = ref(t('tools.markdown-editor.page.defaultSample'));
const html = computed(async () => {
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js');
  return marked.parse(md.value);
});

async function copy() {
  try {
    await navigator.clipboard.writeText(md.value);
    alert(t('tools.markdown-editor.page.copied'));
  } catch {
    alert(t('tools.markdown-editor.page.copyFailed'));
  }
}

function clearAll() {
  md.value = '';
}
</script>

<style>
.prose :where(code):not(:where([class~='not-prose'] *)) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
