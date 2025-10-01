<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.quiz-maker.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.quiz-maker.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.quiz-maker.page.sampleLabel') }}</label>
        <pre class="text-xs p-3 rounded-md border bg-gray-50 dark:bg-gray-800 dark:text-gray-100 overflow-auto">{{ $t('tools.quiz-maker.page.sampleInput') }}</pre>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.quiz-maker.page.inputLabel') }}</label>
        <textarea v-model="raw" rows="10" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" :placeholder="$t('tools.quiz-maker.page.placeholder')" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="parseQuiz" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.quiz-maker.page.parseBtn') }}</button>
      <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.quiz-maker.page.clear') }}</button>
    </div>

    <div v-if="jsonOut" class="space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.quiz-maker.page.resultTitle') }}</div>
        <textarea readonly rows="12" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white">{{ jsonOut }}</textarea>
      </div>
      <div class="flex justify-center gap-3">
        <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">{{ $t('tools.quiz-maker.page.copy') }}</button>
        <button @click="download" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">{{ $t('tools.quiz-maker.page.downloadJson') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const raw = ref('');
const items = ref<Array<{ question: string; options: string[]; answer: string | string[]; type: 'single' | 'multi' }>>([]);

const jsonOut = computed(() => (items.value.length ? JSON.stringify({ items: items.value }, null, 2) : ''));

function parseQuiz() {
  const text = (raw.value || '').trim();
  items.value = [];
  if (!text) return;
  const blocks = text.split(/\n{2,}/);

  for (const b of blocks) {
    const lines = b
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) continue;
    let q = '';
    const options: string[] = [];
    let answer: string | string[] = '';
    let type: 'single' | 'multi' = 'single';

    for (const l of lines) {
      if (/^q[:：]/i.test(l)) {
        q = l.replace(/^q[:：]\s*/i, '');
        continue;
      }
      const mAns = l.match(/^answer\s*=\s*(.+)$/i);
      if (mAns) {
        const a = mAns[1].trim();
        answer = /,/.test(a) ? a.split(/\s*,\s*/).filter(Boolean) : a;
        continue;
      }
      const mType = l.match(/^type\s*=\s*(\w+)/i);
      if (mType) {
        type = mType[1].toLowerCase() === 'multi' ? 'multi' : 'single';
        continue;
      }
      if (/^[A-Z][\)\.\s]+/.test(l) || /^[-•]\s+/.test(l)) {
        options.push(l.replace(/^[A-Z][\)\.\s]+|^[-•]\s+/, ''));
        continue;
      }
      if (!q) q = l;
    }
    if (q) items.value.push({ question: q, options, answer, type });
  }
}

function clearAll() {
  raw.value = '';
  items.value = [];
}

async function copy() {
  if (!jsonOut.value) return;
  try {
    await navigator.clipboard.writeText(jsonOut.value);
    alert(t('tools.quiz-maker.page.copiedAlert'));
  } catch {
    alert(t('tools.quiz-maker.page.copyFailedAlert'));
  }
}

function download() {
  if (!jsonOut.value) return;
  const blob = new Blob([jsonOut.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quiz.json';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
