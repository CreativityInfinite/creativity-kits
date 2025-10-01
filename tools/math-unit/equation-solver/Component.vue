<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.equation-solver.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.equation-solver.page.typeLabel') }}</label>
              <select v-model="type" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="linear">{{ $t('tools.equation-solver.page.optLinear') }}</option>
                <option value="quadratic">{{ $t('tools.equation-solver.page.optQuadratic') }}</option>
                <option value="linear2">{{ $t('tools.equation-solver.page.optLinear2') }}</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">{{ $t('tools.equation-solver.page.paramsLabel') }}</label>
              <input
                v-model="params"
                :placeholder="$t('tools.equation-solver.page.paramsPlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!params.trim()" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.equation-solver.page.solve') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.equation-solver.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.equation-solver.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.equation-solver.page.solutionTitle') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.equation-solver.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.equation-solver.page.download') }}</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="text-xs text-gray-500 mt-2" v-if="processingTime">{{ $t('tools.equation-solver.page.processingTime') }}: {{ processingTime }}ms</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.equation-solver.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">📐</div>
          <div class="text-lg">{{ $t('tools.equation-solver.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.equation-solver.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium">{{ $t('tools.equation-solver.page.typeShort') }} {{ h.type }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ $t('tools.equation-solver.page.paramShort') }} {{ h.params }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.equation-solver.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.equation-solver.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
type HistoryItem = { type: string; params: string; result: string; timestamp: number };
const { t } = useI18n();

const type = ref<'linear' | 'quadratic' | 'linear2'>('linear');
const params = ref('');

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
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'equations.json';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  history.value.unshift({ type: type.value, params: params.value, result: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('equation-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  type.value = h.type as any;
  params.value = h.params;
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('equation-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function solveLinear(a: number, b: number) {
  if (a === 0) return b === 0 ? { infinite: true } : { none: true };
  return { x: -b / a };
}
function solveQuadratic(a: number, b: number, c: number) {
  if (a === 0) return { linear: solveLinear(b, c) };
  const d = b * b - 4 * a * c;
  if (d > 0) {
    const s = Math.sqrt(d);
    return { x1: (-b + s) / (2 * a), x2: (-b - s) / (2 * a), discriminant: d };
  }
  if (d === 0) {
    return { x: -b / (2 * a), discriminant: d };
  }
  const rp = -b / (2 * a),
    ip = Math.sqrt(-d) / (2 * a);
  return { complex: true, x1: `${rp}+${ip}i`, x2: `${rp}-${ip}i`, discriminant: d };
}
function solveLinear2(A: number, B: number, C: number, D: number, E: number, F: number) {
  const det = A * E - B * D;
  if (det === 0) return { noneOrInfinite: true };
  const x = (C * E - B * F) / det;
  const y = (A * F - C * D) / det;
  return { x, y, det };
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    const nums = params.value
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => Number.isFinite(n));
    let out: any;
    if (type.value === 'linear') {
      if (nums.length < 2) throw new Error(t('tools.equation-solver.page.errLinearParams'));
      out = solveLinear(nums[0], nums[1]);
    } else if (type.value === 'quadratic') {
      if (nums.length < 3) throw new Error(t('tools.equation-solver.page.errQuadraticParams'));
      out = solveQuadratic(nums[0], nums[1], nums[2]);
    } else {
      if (nums.length < 6) throw new Error(t('tools.equation-solver.page.errLinear2Params'));
      out = solveLinear2(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]);
    }
    result.value = JSON.stringify({ type: type.value, params: nums, solution: out }, null, 2);
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || t('tools.equation-solver.page.solveFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('equation-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
