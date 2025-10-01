<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.sitemap-generator.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.sitemap-generator.page.urlListLabel') }}</label>
            <textarea
              v-model="urlsText"
              rows="10"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.sitemap-generator.page.urlListPlaceholder')"
            />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.sitemap-generator.page.changefreqLabel') }}</label>
              <select v-model="changefreq" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">{{ $t('tools.sitemap-generator.page.optionNone') }}</option>
                <option>always</option>
                <option>hourly</option>
                <option>daily</option>
                <option>weekly</option>
                <option>monthly</option>
                <option>yearly</option>
                <option>never</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.sitemap-generator.page.priorityLabel') }}</label>
              <input v-model.number="priority" type="number" min="0" max="1" step="0.1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="lastmod" v-model="withLastmod" type="checkbox" class="rounded mr-2" />
              <label for="lastmod" class="text-sm">{{ $t('tools.sitemap-generator.page.lastmodLabel') }}</label>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.sitemap-generator.page.process') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.sitemap-generator.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.sitemap-generator.page.resultTitle') }}</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">{{ $t('tools.sitemap-generator.page.fileTitle') }}</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.sitemap-generator.page.copy') }}
              </button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.sitemap-generator.page.download') }}
              </button>
            </div>
          </div>
          <textarea :value="result" readonly rows="16" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          <div class="text-xs text-gray-500 mt-2" v-if="processingTime">{{ $t('tools.sitemap-generator.page.processingTime') }}: {{ processingTime }}ms</div>
        </div>

        <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.sitemap-generator.page.saveToHistory') }}</button>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-2">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.sitemap-generator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ $t('tools.sitemap-generator.page.historyItemTitle', { count: h.count }) }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">
            {{ $t('tools.sitemap-generator.page.lastmodShort') }}: {{ h.withLastmod ? $t('tools.sitemap-generator.page.yes') : $t('tools.sitemap-generator.page.no') }} · changefreq:
            {{ h.changefreq || '-' }} · priority: {{ h.priority ?? '-' }}
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text白 rounded text-xs">{{ $t('tools.sitemap-generator.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text白 rounded text-xs">{{ $t('tools.sitemap-generator.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
type HistoryItem = { count: number; withLastmod: boolean; changefreq: string; priority: number | null; result: string; timestamp: number };

const urlsText = ref('');
const changefreq = ref('');
const priority = ref<number | null>(0.8);
const withLastmod = ref(true);

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => urlsText.value.trim().length > 0);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.sitemap-generator.page.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = t('tools.sitemap-generator.page.downloadFileName');
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  history.value.unshift({
    count: result.value.match(/<url>/g)?.length || 0,
    withLastmod: withLastmod.value,
    changefreq: changefreq.value,
    priority: priority.value ?? null,
    result: result.value,
    timestamp: Date.now()
  });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('sitemap-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('sitemap-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function escXml(s: string) {
  return s.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/\'/g, '');
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    const lines = urlsText.value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) throw new Error(t('tools.sitemap-generator.page.inputAtLeastOne'));
    // 校验 URL
    const validUrls = lines.map((u) => {
      try {
        return new URL(u).toString();
      } catch {
        throw new Error(t('tools.sitemap-generator.page.invalidUrlPrefix', { u }));
      }
    });
    const now = new Date().toISOString();
    const body = validUrls
      .map((u) => {
        const parts = [`<loc>${escXml(u)}</loc>`];
        if (withLastmod.value) parts.push(`<lastmod>${now}</lastmod>`);
        if (changefreq.value) parts.push(`<changefreq>${changefreq.value}</changefreq>`);
        if (priority.value != null) parts.push(`<priority>${Math.max(0, Math.min(1, priority.value)).toFixed(1)}</priority>`);
        return `  <url>\n    ${parts.join('\n    ')}\n  </url>`;
      })
      .join('\n');
    result.value = `<?xml version="1.0" encoding="UTF-8"?>\n` + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + `${body}\n` + `</urlset>\n`;
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || t('tools.sitemap-generator.page.generateFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('sitemap-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
