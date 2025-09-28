<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">文本可读性分析器</h1>
      <p class="text-gray-600 dark:text-gray-400">输入文本，计算字数、词数、句子数、平均句长，并估算英文 Flesch 阅读难度与中文简易评分。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">文本</label>
        <textarea v-model="text" rows="8" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="在此输入要分析的文本..." />
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="analyze" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">开始分析</button>
    </div>

    <div v-if="result" class="space-y-4">
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">可读性结果</div>
          <div class="text-lg text-gray-600 dark:text-gray-300">综合统计与评分</div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ result.chars }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">字符数</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ result.words }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">词数</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ result.sentences }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">句子数</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ result.avgSentenceLen }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">平均句长</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">英文 Flesch 阅读难度</div>
          <div class="text-2xl font-bold" :class="result.flesch == null ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'">
            {{ result.flesch ?? '无' }}
          </div>
          <p class="text-xs text-gray-500 mt-2">数值越高越易读（典型范围 0–100）。</p>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">中文简易评分</div>
          <div class="text-2xl font-bold" :class="result.chinese.score == null ? 'text-gray-400' : 'text-green-600 dark:text-green-400'">
            {{ result.chinese.score ?? '无' }}
          </div>
          <p class="text-xs text-gray-500 mt-2">粗略指标：考虑平均句长、常用字占比。</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">JSON 输出</label>
        <textarea readonly rows="8" class="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white">{{ jsonOut }}</textarea>
      </div>

      <div class="flex justify-center gap-3">
        <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">复制结果</button>
        <button @click="download" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">下载 JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const text = ref('');
const result = ref<null | {
  chars: number;
  words: number;
  sentences: number;
  avgSentenceLen: number;
  flesch: number | null;
  chinese: { uniqueChars: number; score: number | null };
}>(null);

const jsonOut = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''));

function analyze() {
  const t = (text.value || '').trim();
  if (!t) {
    result.value = null;
    return;
  }

  const sentences = t
    .split(/(?<=[。！？!?\.]+)\s*/u)
    .map((s) => s.trim())
    .filter(Boolean);
  const words = t
    .toLowerCase()
    .split(/[\s，。！？、；;:：“”"'()\[\]\{\}]+/u)
    .filter(Boolean);
  const chars = t.replace(/\s+/g, '').length;

  const syllables = estimateSyllablesEnglish(t);
  const flesch = sentences.length ? 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / Math.max(1, words.length)) : null;

  const zhChars = t.match(/[\u4e00-\u9fa5]/g) || [];
  const uniqueZh = new Set(zhChars).size;
  const avgSentenceLen = sentences.length ? words.length / sentences.length : 0;
  const cnScore = sentences.length ? Math.max(0, 100 - avgSentenceLen * 5 + (uniqueZh / Math.max(1, zhChars.length)) * 20) : null;

  result.value = {
    chars,
    words: words.length,
    sentences: sentences.length,
    avgSentenceLen: Number(avgSentenceLen.toFixed(2)),
    flesch: flesch == null ? null : Number(flesch.toFixed(2)),
    chinese: {
      uniqueChars: uniqueZh,
      score: cnScore == null ? null : Number(cnScore.toFixed(2))
    }
  };
}

function estimateSyllablesEnglish(t: string): number {
  let s = 0;
  const wordList = t.toLowerCase().match(/[a-z]+/g) || [];
  const vowel = /[aeiouy]/;
  for (const w of wordList) {
    let count = 0;
    let prevV = false;
    for (const ch of w) {
      const isV = vowel.test(ch);
      if (isV && !prevV) count++;
      prevV = isV;
    }
    if (w.endsWith('e')) count = Math.max(1, count - 1);
    s += Math.max(1, count);
  }
  return s;
}

async function copy() {
  if (!jsonOut.value) return;
  try {
    await navigator.clipboard.writeText(jsonOut.value);
    alert('已复制到剪贴板');
  } catch (e) {
    alert('复制失败，请手动复制');
  }
}

function download() {
  if (!jsonOut.value) return;
  const blob = new Blob([jsonOut.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'readability.json';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
