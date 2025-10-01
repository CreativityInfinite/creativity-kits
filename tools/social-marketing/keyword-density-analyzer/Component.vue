<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.keyword-density-analyzer.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.keyword-density-analyzer.page.inputLabel') }}</label>
            <textarea
              v-model="inputText"
              rows="10"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.keyword-density-analyzer.page.inputPlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.keyword-density-analyzer.page.params') }}</label>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.keyword-density-analyzer.page.minLength') }}</label>
                <input v-model.number="minLength" type="number" min="1" max="20" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.keyword-density-analyzer.page.topN') }}</label>
                <input v-model.number="topN" type="number" min="1" max="200" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.keyword-density-analyzer.page.ignoreCase') }}</label>
                <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <input id="ignoreCase" v-model="ignoreCase" type="checkbox" class="rounded mr-2" />
                  <label for="ignoreCase" class="text-sm">{{ $t('tools.keyword-density-analyzer.page.yes') }}</label>
                </div>
              </div>
            </div>
            <div class="mt-2">
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.keyword-density-analyzer.page.stopwords') }}</label>
              <input
                v-model="stopwordsText"
                :placeholder="$t('tools.keyword-density-analyzer.page.stopwordsPlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.keyword-density-analyzer.page.analyze') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.keyword-density-analyzer.page.clear') }}</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.keyword-density-analyzer.page.swapView') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.keyword-density-analyzer.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.keyword-density-analyzer.page.resultJson') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.keyword-density-analyzer.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.keyword-density-analyzer.page.download') }}</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>{{ $t('tools.keyword-density-analyzer.page.outputLength') }}: {{ result.length }} {{ $t('tools.keyword-density-analyzer.page.charsUnit') }}</div>
              <div v-if="processingTime">{{ $t('tools.keyword-density-analyzer.page.processingTime') }}: {{ processingTime }}ms</div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.keyword-density-analyzer.page.saveToHistory') }}</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔎</div>
          <div class="text-lg mb-2">{{ $t('tools.keyword-density-analyzer.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.keyword-density-analyzer.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.keyword-density-analyzer.page.processFailed') }}</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.keyword-density-analyzer.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">{{ $t('tools.keyword-density-analyzer.page.historyItemTitle', { count: item.count }) }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.outputLength }} {{ $t('tools.keyword-density-analyzer.page.charsUnit') }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.keyword-density-analyzer.page.load') }}</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.keyword-density-analyzer.page.copyResult') }}</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.keyword-density-analyzer.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.keyword-density-analyzer.page.tipsTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• {{ $t('tools.keyword-density-analyzer.page.tipsStopwords') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

type HistoryItem = { count: number; result: string; outputLength: number; timestamp: number };

const inputText = ref('');
const minLength = ref(2);
const topN = ref(50);
const ignoreCase = ref(true);
const stopwordsText = ref('the,a,an,is,are,of,to,in,for,with,and,or,as,at,by,from,that,this,his,her,its,our,their,和,的,了,在,是,有');

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => inputText.value.trim().length > 0);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function swapView() {
  if (!result.value) return;
  copyResult();
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.keyword-density-analyzer.page.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `${t('tools.keyword-density-analyzer.page.filenamePrefix')}_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const parsed = JSON.parse(result.value);
  const item: HistoryItem = { count: parsed.words?.length || 0, result: result.value, outputLength: result.value.length, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('keyword-density-history', JSON.stringify(history.value));
}
function loadFromHistory(item: HistoryItem) {
  result.value = item.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  localStorage.setItem('keyword-density-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function tokenize(text: string, lower: boolean): string[] {
  const s = lower ? text.toLowerCase() : text;
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const tokens = tokenize(inputText.value, ignoreCase.value);
    const stop = new Set(
      (stopwordsText.value || '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    );
    const counts = new Map<string, number>();
    for (const t of tokens) {
      if (t.length < Math.max(1, minLength.value || 1)) continue;
      if (stop.has(t)) continue;
      counts.set(t, (counts.get(t) || 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    const words = Array.from(counts.entries())
      .map(([word, count]) => ({ word, count, density: total ? +(count / total).toFixed(4) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, Math.max(1, topN.value || 1));

    result.value = JSON.stringify({ total, words }, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.keyword-density-analyzer.page.processFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('keyword-density-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
