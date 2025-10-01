<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.pinyin-converter.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.pinyin-converter.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.pinyin-converter.page.textLabel') }}</label>
        <textarea
          v-model="input"
          rows="6"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.pinyin-converter.page.textPlaceholder')"
        />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="convert" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.pinyin-converter.page.convert') }}</button>
      <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.pinyin-converter.page.clear') }}</button>
    </div>

    <div v-if="output" class="space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.pinyin-converter.page.outputTitle') }}</div>
        <textarea readonly rows="6" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white">{{ output }}</textarea>
      </div>
      <div class="flex justify-center gap-3">
        <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">{{ $t('tools.pinyin-converter.page.copyResult') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const input = ref('');
const { t } = useI18n();
const output = ref('');

async function convert() {
  const text = (input.value || '').trim();
  if (!text) {
    output.value = '';
    return;
  }
  try {
    // 动态按需加载
    // @ts-ignore
    const mod: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.20.0/dist/index.esm.min.js');
    output.value = (mod as any).pinyin(text, { toneType: 'none', type: 'array', nonZh: 'consecutive' }).join(' ');
  } catch (e: any) {
    output.value = t('tools.pinyin-converter.page.convertFailedWithMsg', { msg: e?.message || String(e) });
  }
}

function clearAll() {
  input.value = '';
  output.value = '';
}

async function copy() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.pinyin-converter.page.copied'));
  } catch {
    alert(t('tools.pinyin-converter.page.copyFailed'));
  }
}
</script>
