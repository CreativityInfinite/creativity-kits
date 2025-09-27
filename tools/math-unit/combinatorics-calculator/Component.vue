<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">排列组合计算器</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">n</label>
              <input v-model.number="n" type="number" min="0" max="1000" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">k</label>
              <input v-model.number="k" type="number" min="0" max="1000" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">类型</label>
              <select v-model="kind" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="C">组合 C(n,k)</option>
                <option value="P">排列 P(n,k)</option>
                <option value="F">阶乘 n!</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">计算</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
          <p class="text-xs text-gray-500">使用 BigInt 计算，建议 n≤1000；结果很大时仅显示前后若干位和位数。</p>
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
          <div class="text-4xl mb-3">🧮</div>
          <div class="text-lg">输入 n、k 和类型进行计算</div>
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
            <div class="font-medium">类型 {{ h.kind }} · n={{ h.n }} k={{ h.k }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ h.summary }}</div>
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
import { ref, onMounted } from 'vue'
type HistoryItem = { n: number; k: number; kind: string; result: string; summary: string; timestamp: number }

const n = ref(10)
const k = ref(3)
const kind = ref<'C' | 'P' | 'F'>('C')

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

function clearAll() {
  result.value = ''
  error.value = ''
  processingTime.value = null
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
  a.download = 'comb.json'
  a.click()
  URL.revokeObjectURL(url)
}
function saveToHistory() {
  if (!result.value) return
  const p = JSON.parse(result.value)
  history.value.unshift({ n: n.value, k: k.value, kind: kind.value, result: result.value, summary: p.summary, timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('comb-history', JSON.stringify(history.value))
}
function loadFromHistory(h: HistoryItem) {
  n.value = h.n
  k.value = h.k
  kind.value = h.kind as any
  result.value = h.result
  error.value = ''
  processingTime.value = null
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('comb-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function factBig(n: number) {
  let r = 1n
  for (let i = 2n; i <= BigInt(n); i++) r *= i
  return r
}
function permBig(n: number, k: number) {
  if (k > n) return 0n
  let r = 1n
  for (let i = 0; i < k; i++) r *= BigInt(n - i)
  return r
}
function combBig(n: number, k: number) {
  if (k > n) return 0n
  const kk = Math.min(k, n - k)
  let num = 1n,
    den = 1n
  for (let i = 1; i <= kk; i++) {
    num *= BigInt(n - kk + i)
    den *= BigInt(i)
  }
  // num/den
  // 使用整除（结果应为整数）
  // 为避免实现大整数除法约分，使用逐步约分（小范围）
  const gcd = (a: bigint, b: bigint) => (b === 0n ? a : gcd(b, a % b))
  const g = gcd(num, den)
  return num / g / (den / g)
}
function summarizeBig(x: bigint) {
  const s = x.toString()
  if (s.length <= 64) return { digits: s.length, text: s }
  return { digits: s.length, text: s.slice(0, 32) + '...' + s.slice(-16) }
}

function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const t0 = performance.now()
  try {
    const N = Math.max(0, Math.min(1000, n.value | 0))
    const K = Math.max(0, Math.min(1000, k.value | 0))
    let value: bigint
    let label = ''
    if (kind.value === 'F') {
      value = factBig(N)
      label = `${N}!`
    } else if (kind.value === 'P') {
      value = permBig(N, K)
      label = `P(${N},${K})`
    } else {
      value = combBig(N, K)
      label = `C(${N},${K})`
    }
    const sum = summarizeBig(value)
    result.value = JSON.stringify({ input: { n: N, k: K, kind: kind.value }, label, digits: sum.digits, summary: sum.text, value: value.toString() }, null, 2)
    processingTime.value = Math.round(performance.now() - t0)
  } catch (e: any) {
    error.value = e?.message || '计算失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('comb-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
