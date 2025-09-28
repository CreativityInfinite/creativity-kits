<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">DNS 查询 (DoH)</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">域名</label>
              <input v-model="host" placeholder="example.com" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">记录类型</label>
              <select v-model="rtype" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option>A</option>
                <option>AAAA</option>
                <option>CNAME</option>
                <option>TXT</option>
                <option>MX</option>
                <option>NS</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">查询</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换视图</button>
          </div>

          <p class="text-xs text-gray-500">使用 Cloudflare DoH JSON 接口，可能受网络或 CORS 限制。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">查询结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">结果 JSON</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>输出长度: {{ result.length }} 字符</div>
              <div v-if="processingTime">处理时间: {{ processingTime }}ms</div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🌐</div>
          <div class="text-lg mb-2">DNS 查询</div>
          <div class="text-sm">通过 DNS-over-HTTPS 查询公共记录</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">失败</div>
              <div class="text-sm mt-1 break-all">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">查询历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ item.host }} ({{ item.rtype }})</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

type HistoryItem = { host: string; rtype: string; result: string; timestamp: number };

const host = ref('');
const rtype = ref<'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS'>('A');

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => !!host.value.trim());

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function swapView() {
  if (result.value) copyResult();
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板'));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `dns_${host.value}_${new Date().toISOString().slice(0, 10)}.json`;
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
  const item: HistoryItem = { host: host.value, rtype: rtype.value, result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('dns-lookup-history', JSON.stringify(history.value));
}
function loadFromHistory(item: HistoryItem) {
  host.value = item.host;
  rtype.value = item.rtype as any;
  result.value = item.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('dns-lookup-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

async function dohQuery(name: string, type: string) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, { headers: { accept: 'application/dns-json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const data = await dohQuery(host.value.trim(), rtype.value);
    result.value = JSON.stringify(data, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || '查询失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('dns-lookup-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
