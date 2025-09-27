<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">信用卡号校验（Luhn）</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">卡号</label>
            <input v-model="card" placeholder="示例：4111 1111 1111 1111" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">处理</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">输出</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          <div class="text-xs text-gray-500 mt-2" v-if="processingTime">处理时间: {{ processingTime }}ms</div>
        </div>

        <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-2">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.mask }}</div>
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
import { computed, onMounted, ref } from 'vue'
type HistoryItem = { mask: string; summary: string; result: string; timestamp: number }

const card = ref('')

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

const canProcess = computed(() => card.value.trim().length > 0)

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
  a.download = 'card-validate.json'
  a.click()
  URL.revokeObjectURL(url)
}
function saveToHistory() {
  if (!result.value) return
  const p = JSON.parse(result.value)
  history.value.unshift({ mask: p.mask, summary: `${p.brand || 'Unknown'} | ${p.valid ? '有效' : '无效'}`, result: result.value, timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('cc-history', JSON.stringify(history.value))
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result
  error.value = ''
  processingTime.value = null
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('cc-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function onlyDigits(s: string) {
  return s.replace(/\D+/g, '')
}
function luhnCheck(num: string) {
  let sum = 0
  let dbl = false
  for (let i = num.length - 1; i >= 0; i--) {
    let d = num.charCodeAt(i) - 48
    if (dbl) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    dbl = !dbl
  }
  return sum % 10 === 0
}
function detectBrand(num: string) {
  // 常见品牌（简化版）：仅用于提示
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(num)) return 'Visa'
  if (/^(5[1-5]\d{14})$/.test(num)) return 'MasterCard'
  if (/^(222[1-9]\d{12}|22[3-9]\d{13}|2[3-6]\d{14}|27[01]\d{13}|2720\d{12})$/.test(num)) return 'MasterCard'
  if (/^3[47]\d{13}$/.test(num)) return 'American Express'
  if (/^6(?:011|5\d{2})\d{12}$/.test(num) || /^64[4-9]\d{13}$/.test(num)) return 'Discover'
  if (/^35(2[89]|[3-8]\d)\d{12}$/.test(num)) return 'JCB'
  if (/^62\d{14,17}$/.test(num)) return 'UnionPay'
  if (/^(50|5[6-9]|6[0-9])\d{10,17}$/.test(num)) return 'Maestro'
  return 'Unknown'
}
function maskCard(num: string) {
  const groups: string[] = []
  for (let i = 0; i < num.length; i += 4) groups.push(num.slice(i, i + 4))
  const masked = groups.map((g, idx) => (idx < groups.length - 1 ? g.replace(/\d/g, '*') : g)).join(' ')
  return masked
}

function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const t0 = performance.now()
  try {
    const raw = card.value
    const digits = onlyDigits(raw)
    if (!digits) throw new Error('请输入卡号')
    const brand = detectBrand(digits)
    const valid = luhnCheck(digits)
    const mask = maskCard(digits)
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
    const payload = {
      input: raw,
      digits,
      brand,
      valid,
      length: digits.length,
      formatted,
      mask
    }
    result.value = JSON.stringify(payload, null, 2)
    processingTime.value = Math.round(performance.now() - t0)
  } catch (e: any) {
    error.value = e?.message || '校验失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('cc-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
