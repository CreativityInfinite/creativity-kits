<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">质数测试与生成</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">测试数字</label>
            <input v-model.number="testN" type="number" min="0" placeholder="如 97" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">生成上限/数量</label>
              <input v-model.number="limit" type="number" min="1" placeholder="上限 or 数量" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">模式</label>
              <select v-model="mode" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="upto">生成 <= 上限 的所有质数</option>
                <option value="nextN">从测试数字开始的后续 N 个质数</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">处理</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">输出</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="text-xs text-gray-500 mt-2">处理时间: {{ processingTime }}ms</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🔢</div>
          <div class="text-lg">质数判断与生成</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium">n={{ h.testN }} · 模式 {{ h.mode }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">摘要：{{ h.summary }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
type HistoryItem = { testN: number; mode: string; limit: number; result: string; summary: string; timestamp: number };

const testN = ref(97);
const mode = ref<'upto' | 'nextN'>('upto');
const limit = ref(100);

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert('已复制到剪贴板'));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `primes_${new Date().toISOString().slice(0, 10)}.json`;
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
  const item: HistoryItem = { testN: testN.value, mode: mode.value, limit: limit.value, result: result.value, summary: parsed.summary, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('prime-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  testN.value = h.testN;
  mode.value = h.mode as any;
  limit.value = h.limit;
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('prime-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function isPrime(n: number) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  const r = Math.floor(Math.sqrt(n));
  for (let i = 5; i <= r; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}
function sieve(limit: number) {
  const lim = Math.max(2, limit | 0);
  const mark = new Uint8Array(lim + 1);
  const out: number[] = [];
  for (let i = 2; i <= lim; i++) {
    if (!mark[i]) {
      out.push(i);
      if (i * i <= lim) for (let j = i * i; j <= lim; j += i) mark[j] = 1;
    }
  }
  return out;
}
function nextPrimes(start: number, k: number) {
  const out: number[] = [];
  let n = Math.max(2, start);
  while (out.length < k) {
    if (isPrime(n)) out.push(n);
    n++;
    if (n > 10_000_000) break;
  }
  return out;
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    const tested = isPrime(testN.value);
    let list: number[] = [];
    if (mode.value === 'upto') {
      const up = Math.min(5_000_000, Math.max(2, limit.value || 100));
      list = sieve(up);
    } else {
      const k = Math.min(1000, Math.max(1, limit.value || 20));
      list = nextPrimes(testN.value, k);
    }
    const out = { input: { n: testN.value, mode: mode.value, limit: limit.value }, tested, count: list.length, summary: list.slice(0, 20).join(', ') + (list.length > 20 ? '...' : ''), primes: list };
    result.value = JSON.stringify(out, null, 2);
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || '处理失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('prime-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
