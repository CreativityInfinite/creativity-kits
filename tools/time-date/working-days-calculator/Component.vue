<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.working-days-calculator.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.working-days-calculator.page.startDate') }}</label>
              <input v-model="start" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.working-days-calculator.page.endDateIncl') }}</label>
              <input v-model="end" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="wk6" v-model="weekendSat" type="checkbox" class="rounded mr-2" />
              <label for="wk6" class="text-sm">{{ $t('tools.working-days-calculator.page.weekendSat') }}</label>
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="wk0" v-model="weekendSun" type="checkbox" class="rounded mr-2" />
              <label for="wk0" class="text-sm">{{ $t('tools.working-days-calculator.page.weekendSun') }}</label>
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="incl" v-model="includeBounds" type="checkbox" class="rounded mr-2" />
              <label for="incl" class="text-sm">{{ $t('tools.working-days-calculator.page.includeBounds') }}</label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.working-days-calculator.page.holidaysLabel') }}</label>
            <textarea
              v-model="holidaysText"
              rows="4"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.working-days-calculator.page.holidaysPlaceholder')"
            />
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.working-days-calculator.page.compute') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.working-days-calculator.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.working-days-calculator.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.working-days-calculator.page.stats') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.working-days-calculator.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.working-days-calculator.page.download') }}</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="text-xs text-gray-500 mt-2" v-if="processingTime">{{ $t('tools.working-days-calculator.page.processingTime', { ms: processingTime }) }}</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.working-days-calculator.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">📆</div>
          <div class="text-lg">{{ $t('tools.working-days-calculator.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.working-days-calculator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.range }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs">{{ $t('tools.working-days-calculator.page.workingDays') }}: {{ h.days }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.working-days-calculator.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.working-days-calculator.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
type HistoryItem = { range: string; days: number; params: any; result: string; timestamp: number };
const { t: t_i18n } = useI18n();

const start = ref('');
const end = ref('');
const weekendSat = ref(true);
const weekendSun = ref(true);
const includeBounds = ref(true);
const holidaysText = ref('');

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => !!start.value && !!end.value);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert(t_i18n('common.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'working-days.json';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const p = JSON.parse(result.value);
  history.value.unshift({ range: p.range, days: p.workingDays, params: p.input, result: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('workingdays-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  start.value = h.params.start;
  end.value = h.params.end;
  weekendSat.value = h.params.weekendSat;
  weekendSun.value = h.params.weekendSun;
  includeBounds.value = h.params.includeBounds;
  holidaysText.value = (h.params.holidays || []).join('\n');
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('workingdays-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

function parseHolidays(): Set<string> {
  const set = new Set<string>();
  holidaysText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((d) => set.add(d));
  return set;
}
function isWeekend(d: Date) {
  const wd = d.getDay();
  return (weekendSat.value && wd === 6) || (weekendSun.value && wd === 0);
}
function fmtDate(d: Date) {
  const y = d.getFullYear(),
    m = d.getMonth() + 1,
    da = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    const s = new Date(start.value),
      e = new Date(end.value);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) throw new Error(t_i18n('tools.working-days-calculator.page.invalidRange'));
    if (e < s) throw new Error(t_i18n('tools.working-days-calculator.page.endBeforeStart'));
    const holidays = parseHolidays();
    let cur = new Date(s);
    if (!includeBounds.value) {
      cur.setDate(cur.getDate() + 1);
    }
    const last = new Date(e);
    const days: string[] = [];
    while (cur <= last) {
      if (!isWeekend(cur) && !holidays.has(fmtDate(cur))) days.push(fmtDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    const payload = {
      input: { start: start.value, end: end.value, weekendSat: weekendSat.value, weekendSun: weekendSun.value, includeBounds: includeBounds.value, holidays: Array.from(holidays) },
      range: `${start.value} ~ ${end.value}`,
      workingDays: days.length,
      days
    };
    result.value = JSON.stringify(payload, null, 2);
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || t_i18n('tools.working-days-calculator.page.computeFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('workingdays-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
