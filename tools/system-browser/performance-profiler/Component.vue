<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">性能分析器</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">测试类型</label>
              <select v-model="kind" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="json">JSON 解析(大字符串)</option>
                <option value="compute">计算(数组排序)</option>
                <option value="fetch">网络请求(fetch)</option>
              </select>
            </div>
            <div v-if="kind === 'fetch'">
              <label class="block text-sm font-medium mb-1">URL</label>
              <input v-model="url" placeholder="https://example.com" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">开始</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
          <p class="text-xs text-gray-500">注意：fetch 受 CORS 影响；本工具仅用于简要性能评估。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
          <div class="flex justify-between items-center">
            <h4 class="font-medium">测量</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.kind }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ h.summary }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
type HistoryItem = { kind: string; summary: string; result: string; timestamp: number }

const kind = ref<'json' | 'compute' | 'fetch'>('json')
const url = ref('https://jsonplaceholder.typicode.com/todos/1')

const result = ref('')
const error = ref('')
const history = ref<HistoryItem[]>([])

function clearAll() {
  result.value = ''
  error.value = ''
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert('已复制到剪贴板'))
}
function copyResult() {
  if (result.value) copyText(result.value)
}
function downloadResult() {
  if (!result.value) return
  const blob = new Blob([result.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'perf.json'
  a.click()
  URL.revokeObjectURL(url)
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('perf-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function measureJson() {
  const size = 50000
  const arr = Array.from({ length: size }, (_, i) => ({ id: i, txt: 'x'.repeat(20) }))
  const payload = JSON.stringify(arr)
  const t0 = performance.now()
  const parsed = JSON.parse(payload)
  const t1 = performance.now()
  return { type: 'json', payloadBytes: payload.length, items: parsed.length, ms: Math.round(t1 - t0) }
}
function measureCompute() {
  const size = 100000
  const arr = Array.from({ length: size }, () => Math.random())
  const t0 = performance.now()
  arr.sort((a, b) => a - b)
  const t1 = performance.now()
  return { type: 'compute', items: size, ms: Math.round(t1 - t0), min: arr[0], max: arr[arr.length - 1] }
}
async function measureFetch() {
  const t0 = performance.now()
  const res = await fetch(url.value, { cache: 'no-store' })
  const t1 = performance.now()
  const text = await res.text()
  const t2 = performance.now()
  return { type: 'fetch', url: url.value, status: res.status, bytes: text.length, ms_network: Math.round(t1 - t0), ms_read: Math.round(t2 - t1), ms_total: Math.round(t2 - t0) }
}

async function process() {
  error.value = ''
  result.value = ''
  try {
    let out: any
    if (kind.value === 'json') out = measureJson()
    else if (kind.value === 'compute') out = measureCompute()
    else out = await measureFetch()
    result.value = JSON.stringify(out, null, 2)
    history.value.unshift({
      kind: kind.value,
      summary: Object.entries(out)
        .map(([k, v]) => `${k}=${v}`)
        .slice(0, 5)
        .join(', '),
      result: result.value,
      timestamp: Date.now()
    })
    if (history.value.length > 10) history.value = history.value.slice(0, 10)
    localStorage.setItem('perf-history', JSON.stringify(history.value))
  } catch (e: any) {
    error.value = e?.message || '测量失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('perf-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
