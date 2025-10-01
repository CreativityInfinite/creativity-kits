<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.ip-geo-lookup.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.ip-geo-lookup.page.ipLabel') }}</label>
            <input v-model="ip" :placeholder="$t('tools.ip-geo-lookup.page.ipPlaceholder')" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.ip-geo-lookup.page.query') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.ip-geo-lookup.page.clear') }}</button>
          </div>

          <p class="text-xs text-gray-500">{{ $t('tools.ip-geo-lookup.page.note') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.ip-geo-lookup.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.ip-geo-lookup.page.queryResult') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.ip-geo-lookup.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.ip-geo-lookup.page.download') }}</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>{{ $t('tools.ip-geo-lookup.page.outputLen') }}: {{ result.length }} {{ $t('tools.ip-geo-lookup.page.chars') }}</div>
              <div v-if="processingTime">{{ $t('tools.ip-geo-lookup.page.processingTime') }}: {{ processingTime }}ms</div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.ip-geo-lookup.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📍</div>
          <div class="text-lg mb-2">{{ $t('tools.ip-geo-lookup.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.ip-geo-lookup.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.ip-geo-lookup.page.failed') }}</div>
              <div class="text-sm mt-1 break-all">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.ip-geo-lookup.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ item.ip || $t('tools.ip-geo-lookup.page.myIp') }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.ip-geo-lookup.page.load') }}</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.ip-geo-lookup.page.copy') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.ip-geo-lookup.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

type HistoryItem = { ip: string; result: string; timestamp: number };

const ip = ref('');
const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('common.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `ipgeo_${ip.value || 'me'}_${new Date().toISOString().slice(0, 10)}.json`;
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
  const item: HistoryItem = { ip: ip.value.trim(), result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('ip-geo-history', JSON.stringify(history.value));
}
function loadFromHistory(item: HistoryItem) {
  ip.value = item.ip;
  result.value = item.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('ip-geo-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

async function query(ipStr: string) {
  const base = 'https://ipapi.co';
  const url = ipStr ? `${base}/${encodeURIComponent(ipStr)}/json/` : `${base}/json/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const data = await query(ip.value.trim());
    result.value = JSON.stringify(data, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.ip-geo-lookup.page.queryFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('ip-geo-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
