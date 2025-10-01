<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.lorem-ipsum-generator.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.lorem-ipsum-generator.page.params') }}</label>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.lorem-ipsum-generator.page.paragraphs') }}</label>
                <input v-model.number="paragraphs" type="number" min="1" max="50" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.lorem-ipsum-generator.page.wordsPerParagraph') }}</label>
                <input v-model.number="wordsPerParagraph" type="number" min="3" max="80" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.lorem-ipsum-generator.page.endWithPeriod') }}</label>
                <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <input id="withPeriod" v-model="withPeriod" type="checkbox" class="rounded mr-2" />
                  <label for="withPeriod" class="text-sm">{{ $t('tools.lorem-ipsum-generator.page.yes') }}</label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.lorem-ipsum-generator.page.customWords') }}</label>
            <input v-model="customWords" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="lorem, ipsum, dolor, sit, amet" />
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.lorem-ipsum-generator.page.generate') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.lorem-ipsum-generator.page.clear') }}</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.lorem-ipsum-generator.page.swapView') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.lorem-ipsum-generator.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.lorem-ipsum-generator.page.loremText') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.lorem-ipsum-generator.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.lorem-ipsum-generator.page.download') }}</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>{{ $t('tools.lorem-ipsum-generator.page.outputLength') }}: {{ result.length }} {{ $t('tools.lorem-ipsum-generator.page.chars') }}</div>
              <div v-if="processingTime">{{ $t('tools.lorem-ipsum-generator.page.processingTime') }}: {{ processingTime }}ms</div>
              <div>{{ $t('tools.lorem-ipsum-generator.page.paragraphsShort') }}: {{ paragraphs }} · {{ $t('tools.lorem-ipsum-generator.page.wordsPerParagraphShort') }}: {{ wordsPerParagraph }}</div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.lorem-ipsum-generator.page.saveToHistory') }}</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📝</div>
          <div class="text-lg mb-2">{{ $t('tools.lorem-ipsum-generator.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.lorem-ipsum-generator.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.lorem-ipsum-generator.page.processFailedTitle') }}</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.lorem-ipsum-generator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">
                {{ $t('tools.lorem-ipsum-generator.page.paragraphsShort') }} {{ item.paragraphs }} · {{ $t('tools.lorem-ipsum-generator.page.wordsPerParagraphShort') }} {{ item.wordsPerParagraph }}
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.outputLength }} {{ $t('tools.lorem-ipsum-generator.page.chars') }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.lorem-ipsum-generator.page.load') }}</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.lorem-ipsum-generator.page.copyResult') }}</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.lorem-ipsum-generator.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.lorem-ipsum-generator.page.tipsTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• {{ $t('tools.lorem-ipsum-generator.page.tipCustomWords') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

type HistoryItem = { paragraphs: number; wordsPerParagraph: number; result: string; outputLength: number; timestamp: number };

const paragraphs = ref(3);
const wordsPerParagraph = ref(20);
const withPeriod = ref(true);
const customWords = ref('');

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
  customWords.value = '';
}
function swapView() {
  if (!result.value) return;
  copyResult();
}
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('common.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `lorem_${new Date().toISOString().slice(0, 10)}.txt`;
  const blob = new Blob([result.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const item: HistoryItem = {
    paragraphs: paragraphs.value,
    wordsPerParagraph: wordsPerParagraph.value,
    result: result.value,
    outputLength: result.value.length,
    timestamp: Date.now()
  };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('lorem-history', JSON.stringify(history.value));
}
function loadFromHistory(item: HistoryItem) {
  paragraphs.value = item.paragraphs;
  wordsPerParagraph.value = item.wordsPerParagraph;
  result.value = item.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  localStorage.setItem('lorem-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

const DEFAULT_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua'
];

function randomWord(pool: string[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();

  try {
    const p = Math.max(1, Math.min(50, paragraphs.value || 1));
    const w = Math.max(3, Math.min(200, wordsPerParagraph.value || 3));
    const pool = (customWords.value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const words = pool.length ? pool : DEFAULT_WORDS;

    const paras: string[] = [];
    for (let i = 0; i < p; i++) {
      const arr: string[] = [];
      for (let j = 0; j < w; j++) arr.push(randomWord(words));
      let text = capitalize(arr.join(' '));
      if (withPeriod.value) text += '.';
      paras.push(text);
    }
    result.value = paras.join('\n\n');
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.lorem-ipsum-generator.page.generateFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('lorem-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
