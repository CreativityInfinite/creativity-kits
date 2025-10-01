<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.hashtag-generator.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.hashtag-generator.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.hashtag-generator.page.inputLabel') }}</label>
        <textarea
          v-model="text"
          rows="6"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.hashtag-generator.page.inputPlaceholder')"
        />
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.hashtag-generator.page.maxCount') }}</label>
          <input v-model.number="maxCount" type="number" min="1" max="50" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.hashtag-generator.page.minLen') }}</label>
          <input v-model.number="minLen" type="number" min="2" max="20" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="generate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.hashtag-generator.page.generate') }}</button>
      <button v-if="tags.length" @click="copy" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.hashtag-generator.page.copy') }}</button>
    </div>

    <div v-if="tags.length" class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
      <div class="flex flex-wrap gap-2">
        <span v-for="t in tags" :key="t" class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded text-sm border border-blue-200 dark:border-blue-800">#{{ t }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const text = ref('');
const { t } = useI18n();
const maxCount = ref(15);
const minLen = ref(3);
const tags = ref<string[]>([]);

function generate() {
  const input = (text.value || '').toLowerCase();
  const words = input
    .replace(/[^\p{L}\p{N}\s_-]+/gu, ' ')
    .split(/[\s_-]+/g)
    .map((w) => w.trim())
    .filter((w) => w && w.length >= (minLen.value || 3));

  const stop = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'are',
    'you',
    'your',
    'a',
    'an',
    'to',
    'in',
    'on',
    'of',
    'or',
    'as',
    'at',
    'is',
    'be',
    'by',
    'it',
    'we',
    'our',
    'they',
    'them',
    'i'
  ]);
  const freq = new Map<string, number>();
  for (const w of words) {
    if (stop.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  tags.value = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, Math.min(50, maxCount.value || 15)))
    .map(([w]) => w);
}

async function copy() {
  if (!tags.value.length) return;
  try {
    await navigator.clipboard.writeText(tags.value.map((w) => `#${w}`).join(' '));
    alert(t('tools.hashtag-generator.page.copied'));
  } catch {
    alert(t('tools.hashtag-generator.page.copyFailed'));
  }
}
</script>
