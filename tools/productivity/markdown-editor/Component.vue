<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Markdown 编辑器</h1>
      <p class="text-gray-600 dark:text-gray-400">支持实时预览的轻量级 Markdown 编辑器（浏览器本地渲染）。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Markdown</div>
        <textarea v-model="md" rows="16" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
        <div class="flex justify-center gap-3 mt-3">
          <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">复制</button>
          <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">预览</div>
        <div v-html="html" class="prose prose-sm dark:prose-invert max-w-none"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const md = ref('# Hello\n\n- 这是一个示例\n- 支持实时预览');
const html = computed(async () => {
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js');
  return marked.parse(md.value);
});

async function copy() {
  try {
    await navigator.clipboard.writeText(md.value);
    alert('已复制');
  } catch {
    alert('复制失败，请手动复制');
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
