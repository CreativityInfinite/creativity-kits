<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.csv-merge-split.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-merge-split.page.operation') }}</label>
              <select v-model="mode" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="merge">{{ $t('tools.csv-merge-split.page.mergeOption') }}</option>
                <option value="split">{{ $t('tools.csv-merge-split.page.splitOption') }}</option>
              </select>
            </div>
            <div v-if="mode === 'split'">
              <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-merge-split.page.rowsPerFile') }}</label>
              <input v-model.number="chunkSize" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="hasHeader" v-model="hasHeader" type="checkbox" class="rounded mr-2" />
              <label for="hasHeader" class="text-sm">{{ $t('tools.csv-merge-split.page.hasHeader') }}</label>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-merge-split.page.separator') }}</label>
              <select v-model="sep" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value=",">{{ $t('tools.csv-merge-split.page.comma') }}</option>
                <option value="\t">{{ $t('tools.csv-merge-split.page.tab') }}</option>
                <option value=";">{{ $t('tools.csv-merge-split.page.semicolon') }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-merge-split.page.uploadCSV') }}</label>
            <input type="file" multiple accept=".csv,text/csv" @change="onFiles" />
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.csv-merge-split.page.process') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.csv-merge-split.page.clearAll') }}</button>
          </div>
          <p class="text-xs text-gray-500">{{ $t('tools.csv-merge-split.page.note') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.csv-merge-split.page.result') }}</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.csv-merge-split.page.output') }}</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.csv-merge-split.page.copy') }}
              </button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.csv-merge-split.page.download') }}
              </button>
            </div>
          </div>
          <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          <div class="text-xs text-gray-500" v-if="processingTime">{{ $t('tools.csv-merge-split.page.processingTime') }}: {{ processingTime }}ms</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.csv-merge-split.page.history') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.mode }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ $t('tools.csv-merge-split.page.filesCount') }}: {{ h.files }} · {{ $t('tools.csv-merge-split.page.summary') }}: {{ h.summary }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.csv-merge-split.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.csv-merge-split.page.remove') }}</button>
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
type HistoryItem = { mode: string; files: number; summary: string; result: string; timestamp: number };

const mode = ref<'merge' | 'split'>('merge');
const chunkSize = ref(1000);
const hasHeader = ref(true);
const sep = ref(',');

const files = ref<File[]>([]);
const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => files.value.length > 0);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
  files.value = [];
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.csv-merge-split.page.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = mode.value === 'merge' ? 'merged.csv' : 'split.json';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const summary = result.value.slice(0, 200).replace(/\s+/g, ' ');
  history.value.unshift({ mode: mode.value, files: files.value.length, summary, result: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('csvms-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('csvms-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

function onFiles(e: Event) {
  files.value = Array.from((e.target as HTMLInputElement).files || []);
}

function parseCSV(text: string, sepChar: string): string[][] {
  const q = '"';
  const rows: string[][] = [];
  let cell = '';
  let row: string[] = [];
  let inQ = false;
  const pushCell = () => {
    row.push(cell);
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
        } else inQ = false;
      } else cell += ch;
    } else {
      if (ch === q) inQ = true;
      else if (ch === sepChar) pushCell();
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
function toCSV(rows: string[][], sepChar: string): string {
  const q = '"';
  const needs = (s: string) => s.includes(sepChar) || s.includes('\n') || s.includes('\r') || s.includes(q);
  return rows
    .map((r) =>
      r
        .map((c) => {
          c = c ?? '';
          if (needs(c)) return q + c.replaceAll(q, q + q) + q;
          return c;
        })
        .join(sepChar)
    )
    .join('\n');
}
async function readFileText(f: File) {
  return await f.text();
}

async function doMerge() {
  const tables: string[][][] = [];
  for (const f of files.value) {
    const txt = await readFileText(f);
    const rows = parseCSV(txt, sep.value === '\\t' ? '\t' : sep.value);
    if (rows.length) tables.push(rows);
  }
  if (!tables.length) throw new Error(t('tools.csv-merge-split.page.noValidData'));
  const headersSet = new Set<string>();
  if (hasHeader.value) {
    for (const t of tables) {
      for (const h of t[0] || []) headersSet.add(h);
    }
  } else {
    // 生成列名 col1,col2,...
    const maxCols = Math.max(...tables.map((t) => Math.max(...t.map((r) => r.length))));
    for (let i = 1; i <= maxCols; i++) headersSet.add(`col${i}`);
  }
  const headers = Array.from(headersSet);
  const out: string[][] = [headers];
  for (const t of tables) {
    const start = hasHeader.value ? 1 : 0;
    for (let i = start; i < t.length; i++) {
      const row = t[i];
      const map: Record<string, string> = {};
      if (hasHeader.value) {
        const hs = t[0] || [];
        for (let c = 0; c < hs.length; c++) map[hs[c]] = row[c] ?? '';
      } else {
        for (let c = 0; c < row.length; c++) map[`col${c + 1}`] = row[c] ?? '';
      }
      out.push(headers.map((h) => map[h] ?? ''));
    }
  }
  result.value = toCSV(out, sep.value === '\\t' ? '\t' : sep.value);
}

async function doSplit() {
  // 将所有文件顺序拼接为单表（若首行有表头，仅取第一个文件的表头）
  let merged: string[][] = [];
  let header: string[] = [];
  for (let idx = 0; idx < files.value.length; idx++) {
    const txt = await readFileText(files.value[idx]);
    const rows = parseCSV(txt, sep.value === '\\t' ? '\t' : sep.value);
    if (!rows.length) continue;
    if (idx === 0 && hasHeader.value) {
      header = rows[0];
      merged = rows.slice(1);
    } else {
      merged.push(...(hasHeader.value ? rows.slice(1) : rows));
    }
  }
  const chunks: { index: number; csv: string }[] = [];
  const sepChar = sep.value === '\\t' ? '\t' : sep.value;
  for (let i = 0; i < merged.length; i += chunkSize.value || 1000) {
    const part = merged.slice(i, i + (chunkSize.value || 1000));
    const data = hasHeader.value ? [header, ...part] : part;
    chunks.push({ index: chunks.length + 1, csv: toCSV(data, sepChar) });
  }
  result.value = JSON.stringify(
    { count: chunks.length, note: t('tools.csv-merge-split.page.saveChunksNote'), files: chunks.map((c) => ({ index: c.index, size: c.csv.split('\n').length })), first: chunks[0]?.csv || '' },
    null,
    2
  );
}

async function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    if (mode.value === 'merge') await doMerge();
    else await doSplit();
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || t('tools.csv-merge-split.page.processingFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('csvms-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
