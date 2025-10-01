<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.tsv-converter.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.tsv-converter.page.inputLabel') }}</label>
            <textarea
              v-model="inputText"
              rows="10"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.tsv-converter.page.inputPlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.tsv-converter.page.params') }}</label>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.tsv-converter.page.srcSep') }}</label>
                <select v-model="src" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value=",">{{ $t('tools.tsv-converter.page.csv') }}</option>
                  <option value="\t">{{ $t('tools.tsv-converter.page.tsv') }}</option>
                  <option value="auto">{{ $t('tools.tsv-converter.page.autoDetect') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.tsv-converter.page.dstSep') }}</label>
                <select v-model="dst" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value=",">CSV (,)</option>
                  <option value="\t">TSV (Tab)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.tsv-converter.page.quoteChar') }}</label>
                <input v-model="quote" placeholder='"' class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <input id="hasHeader" v-model="hasHeader" type="checkbox" class="rounded mr-2" />
                <label for="hasHeader" class="text-sm">{{ $t('tools.tsv-converter.page.hasHeader') }}</label>
              </div>
              <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <input id="trimCell" v-model="trimCell" type="checkbox" class="rounded mr-2" />
                <label for="trimCell" class="text-sm">{{ $t('tools.tsv-converter.page.trimCell') }}</label>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.tsv-converter.page.convert') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.tsv-converter.page.clear') }}</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.tsv-converter.page.swapView') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.tsv-converter.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.tsv-converter.page.outputText') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.tsv-converter.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.tsv-converter.page.download') }}</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>{{ $t('tools.tsv-converter.page.outputLength') }}: {{ result.length }}</div>
              <div v-if="processingTime">{{ $t('tools.tsv-converter.page.processingTime') }}: {{ processingTime }}ms</div>
              <div>{{ $t('tools.tsv-converter.page.rows') }}: {{ stats.rows }} · {{ $t('tools.tsv-converter.page.cols') }}: {{ stats.cols }}</div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.tsv-converter.page.saveToHistory') }}</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">↔️</div>
          <div class="text-lg mb-2">{{ $t('tools.tsv-converter.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.tsv-converter.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.tsv-converter.page.errorTitle') }}</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.tsv-converter.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div class="font-medium">{{ $t('tools.tsv-converter.page.row') }} {{ item.rows }} · {{ $t('tools.tsv-converter.page.col') }} {{ item.cols }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.tsv-converter.page.load') }}</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.tsv-converter.page.copy') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.tsv-converter.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.tsv-converter.page.tipTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• {{ $t('tools.tsv-converter.page.tipLine1') }}</div>
        <div>• {{ $t('tools.tsv-converter.page.tipLine2') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
type HistoryItem = { rows: number; cols: number; result: string; timestamp: number };
type Stats = { rows: number; cols: number };

const inputText = ref('');
const src = ref<'auto' | ',' | '\\t'>('auto');
const dst = ref<',' | '\\t'>(',');
const quote = ref('"');
const hasHeader = ref(true);
const trimCell = ref(true);

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const stats = ref<Stats>({ rows: 0, cols: 0 });
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => inputText.value.trim().length > 0);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
  stats.value = { rows: 0, cols: 0 };
}
function swapView() {
  if (result.value) copyResult();
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('common.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const ext = dst.value === ',' ? 'csv' : 'tsv';
  const filename = `convert_${new Date().toISOString().slice(0, 10)}.${ext}`;
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
  const item: HistoryItem = { rows: stats.value.rows, cols: stats.value.cols, result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('tsv-convert-history', JSON.stringify(history.value));
}
function loadFromHistory(item: HistoryItem) {
  result.value = item.result;
  stats.value = { rows: item.rows, cols: item.cols };
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('tsv-convert-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

function autoDetectSep(text: string): string {
  const first = text.split(/\r?\n/, 1)[0] || '';
  const c = (first.match(/,/g) || []).length;
  const t = (first.match(/\t/g) || []).length;
  return t > c ? '\t' : ',';
}
function parse(text: string, sep: string): string[][] {
  const q = quote.value || '"';
  const rows: string[][] = [];
  let cell = '',
    row: string[] = [],
    inQ = false;
  const pushCell = () => {
    row.push(trimCell.value ? cell.trim() : cell);
    cell = '';
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === q) {
        if (text[i + 1] === q) {
          cell += q;
          i++;
        } else {
          inQ = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === q) inQ = true;
      else if (ch === sep) pushCell();
      else if (ch === '\n') {
        pushCell();
        pushRow();
      } else if (ch === '\r') {
        /* ignore */
      } else cell += ch;
    }
  }
  pushCell();
  pushRow();
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
  return rows;
}
function toSeparated(rows: string[][], sep: string): string {
  const q = quote.value || '"';
  const needsQuote = (s: string) => s.includes(sep) || s.includes('\n') || s.includes('\r') || s.includes(q);
  return rows
    .map((r) =>
      r
        .map((c) => {
          if (c == null) c = '';
          c = String(c);
          if (needsQuote(c)) return q + c.replaceAll(q, q + q) + q;
          return c;
        })
        .join(sep)
    )
    .join('\n');
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  stats.value = { rows: 0, cols: 0 };
  const start = performance.now();
  try {
    const text = inputText.value;
    const sep = src.value === 'auto' ? autoDetectSep(text) : src.value === '\\t' ? '\t' : ',';
    const outSep = dst.value === '\\t' ? '\t' : ',';
    const rows = parse(text, sep);
    if (!rows.length) throw new Error(t('tools.tsv-converter.page.noValidData'));
    const cols = Math.max(...rows.map((r) => r.length));
    stats.value = { rows: rows.length, cols };
    // 若目标分隔符与源相同，仍重建以规范化
    const normalized = rows.map((r) => {
      const rr = r.slice();
      while (rr.length < cols) rr.push('');
      return rr;
    });
    result.value = toSeparated(normalized, outSep);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.tsv-converter.page.convertFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('tsv-convert-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
