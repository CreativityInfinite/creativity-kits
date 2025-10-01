<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.cron-next-run.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.cron-next-run.page.exprLabel') }}</label>
            <input v-model="expr" :placeholder="$t('tools.cron-next-run.page.exprPlaceholder')" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.cron-next-run.page.startTime') }}</label>
              <input v-model="startAt" type="datetime-local" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.cron-next-run.page.count') }}</label>
              <input v-model.number="count" type="number" min="1" max="50" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.cron-next-run.page.compute') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.cron-next-run.page.clear') }}</button>
          </div>

          <p class="text-xs text-gray-500">{{ $t('tools.cron-next-run.page.helpTip') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.cron-next-run.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.cron-next-run.page.nextCount', { count: parsed.count }) }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.cron-next-run.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.cron-next-run.page.download') }}</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="text-xs text-gray-500 mt-2">{{ $t('tools.cron-next-run.page.processingTime') }}: {{ processingTime }}ms</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.cron-next-run.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">⏰</div>
          <div class="text-lg">{{ $t('tools.cron-next-run.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.cron-next-run.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.expr }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs">
            {{ $t('tools.cron-next-run.page.startShort') }}: {{ new Date(h.startAt).toLocaleString(undefined, { hour12: false }) }} · {{ $t('tools.cron-next-run.page.takeN', { n: h.count }) }}
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.cron-next-run.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.cron-next-run.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
type HistoryItem = { expr: string; startAt: number; count: number; result: string; timestamp: number };
const { t } = useI18n();

const expr = ref('*/5 * * * *');
const startAt = ref('');
const count = ref(5);

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);
const parsed = ref<{ count: number } & Record<string, any>>({ count: 0 });

const canProcess = computed(() => !!expr.value.trim());

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.cron-next-run.page.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `cron_${new Date().toISOString().slice(0, 10)}.json`;
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
  const item: HistoryItem = { expr: expr.value, startAt: getStartTime(), count: count.value || 5, result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('cron-next-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  expr.value = h.expr;
  startAt.value = new Date(h.startAt).toISOString().slice(0, 16);
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('cron-next-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

function parseField(f: string, min: number, max: number): Set<number> {
  const out = new Set<number>();
  const parts = f.split(',');
  for (const p of parts) {
    if (p.includes('/')) {
      const [lhs, stepStr] = p.split('/');
      const step = Math.max(1, parseInt(stepStr || '1', 10) || 1);
      if (lhs === '*' || lhs === '') {
        for (let v = min; v <= max; v += step) out.add(v);
      } else if (lhs.includes('-')) {
        const [a, b] = lhs.split('-').map((x) => parseInt(x, 10));
        const lo = Math.max(min, Math.min(a, b));
        const hi = Math.min(max, Math.max(a, b));
        for (let v = lo; v <= hi; v += step) out.add(v);
      } else {
        const v = parseInt(lhs, 10);
        if (Number.isFinite(v)) for (let x = v; x <= max; x += step) if (x >= min) out.add(x);
      }
    } else if (p.includes('-')) {
      const [a, b] = p.split('-').map((x) => parseInt(x, 10));
      const lo = Math.max(min, Math.min(a, b));
      const hi = Math.min(max, Math.max(a, b));
      for (let v = lo; v <= hi; v++) out.add(v);
    } else if (p === '*' || p === '') {
      for (let v = min; v <= max; v++) out.add(v);
    } else {
      const v = parseInt(p, 10);
      if (Number.isFinite(v) && v >= min && v <= max) out.add(v);
    }
  }
  return out;
}
function parseCron(exp: string) {
  const [m, h, dom, mon, dow] = exp.trim().split(/\s+/);
  if ([m, h, dom, mon, dow].some((x) => !x)) throw new Error(t('tools.cron-next-run.page.needFiveFields'));
  return {
    minutes: parseField(m, 0, 59),
    hours: parseField(h, 0, 23),
    days: parseField(dom, 1, 31),
    months: parseField(mon, 1, 12),
    dows: parseField(dow, 0, 6)
  };
}
function matches(dt: Date, cron: any) {
  return cron.minutes.has(dt.getMinutes()) && cron.hours.has(dt.getHours()) && cron.days.has(dt.getDate()) && cron.months.has(dt.getMonth() + 1) && cron.dows.has(dt.getDay());
}
function getStartTime() {
  if (startAt.value) {
    const t = new Date(startAt.value).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return Date.now();
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const cron = parseCron(expr.value);
    const begin = new Date(getStartTime());
    begin.setSeconds(0, 0);
    const next: string[] = [];
    const maxScan = 365 * 24 * 60; // 365天
    let cur = new Date(begin.getTime());
    let scanned = 0;
    while (next.length < (count.value || 5) && scanned < maxScan) {
      if (matches(cur, cron)) next.push(cur.toLocaleString(undefined, { hour12: false }));
      cur = new Date(cur.getTime() + 60 * 1000);
      scanned++;
    }
    if (!next.length) throw new Error(t('tools.cron-next-run.page.noMatches'));
    const out = { expr: expr.value, start: begin.toISOString(), count: count.value || 5, next };
    parsed.value = { count: out.count };
    result.value = JSON.stringify(out, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.cron-next-run.page.computeFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('cron-next-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
