<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">IBAN 校验</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">IBAN</label>
            <input v-model="iban" placeholder="示例：DE89 3704 0044 0532 0130 00" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
            <div class="font-medium truncate">{{ h.summary }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
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
type HistoryItem = { summary: string; result: string; timestamp: number }

const iban = ref('')

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

const canProcess = computed(() => iban.value.trim().length > 0)

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
  a.download = 'iban-validate.json'
  a.click()
  URL.revokeObjectURL(url)
}
function saveToHistory() {
  if (!result.value) return
  const p = JSON.parse(result.value)
  history.value.unshift({ summary: `${p.normalized} | ${p.valid ? '有效' : '无效'}`, result: result.value, timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('iban-history', JSON.stringify(history.value))
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result
  error.value = ''
  processingTime.value = null
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('iban-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

// 常见国家 IBAN 长度（部分）
const countryLen: Record<string, number> = {
  AL: 28,
  AD: 24,
  AT: 20,
  AZ: 28,
  BE: 16,
  BA: 20,
  BG: 22,
  HR: 21,
  CY: 28,
  CZ: 24,
  DK: 18,
  EE: 20,
  FI: 18,
  FR: 27,
  GE: 22,
  DE: 22,
  GI: 23,
  GR: 27,
  HU: 28,
  IS: 26,
  IE: 22,
  IL: 23,
  IT: 27,
  JO: 30,
  KZ: 20,
  KW: 30,
  LV: 21,
  LB: 28,
  LI: 21,
  LT: 20,
  LU: 20,
  MK: 19,
  MT: 31,
  MR: 27,
  MU: 30,
  MC: 27,
  MD: 24,
  ME: 22,
  NL: 18,
  NO: 15,
  PK: 24,
  PS: 29,
  PL: 28,
  PT: 25,
  QA: 29,
  RO: 24,
  SM: 27,
  SA: 24,
  RS: 22,
  SK: 24,
  SI: 19,
  ES: 24,
  SE: 24,
  CH: 21,
  TN: 24,
  TR: 26,
  AE: 23,
  GB: 22,
  VA: 22,
  XK: 20
}

function normalize(s: string) {
  return s.replace(/\s+/g, '').toUpperCase()
}
function spaced(s: string) {
  return s.replace(/(.{4})/g, '$1 ').trim()
}
function mod97(s: string) {
  // 大数分段取模
  let rem = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i)
    const v = ch >= 65 && ch <= 90 ? ch - 55 : ch - 48
    rem = (rem * 10 + v) % 97
  }
  return rem
}

function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const t0 = performance.now()
  try {
    const raw = iban.value
    const norm = normalize(raw)
    if (!/^[A-Z0-9]+$/.test(norm) || norm.length < 4) throw new Error('格式不正确')
    const cc = norm.slice(0, 2)
    const lenOk = countryLen[cc] ? countryLen[cc] === norm.length : true
    // Rearrange and convert
    const moved = norm.slice(4) + norm.slice(0, 4)
    let converted = ''
    for (let i = 0; i < moved.length; i++) {
      const ch = moved[i]
      if (ch >= 'A' && ch <= 'Z') converted += String(ch.charCodeAt(0) - 55)
      else converted += ch
    }
    const checksumOk = mod97(converted) === 1
    const valid = lenOk && checksumOk
    const payload = {
      input: raw,
      normalized: norm,
      spaced: spaced(norm),
      country: cc,
      expectedLength: countryLen[cc] || null,
      length: norm.length,
      lengthOk: lenOk,
      checksumOk,
      valid
    }
    result.value = JSON.stringify(payload, null, 2)
    processingTime.value = Math.round(performance.now() - t0)
  } catch (e: any) {
    error.value = e?.message || '校验失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('iban-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
