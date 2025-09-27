<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">文本编码转换</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">输入文本或文件</label>
            <textarea v-model="inputText" rows="8" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="粘贴文本或选择文件" />
            <input type="file" @change="onFile" class="mt-2" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">源编码</label>
              <select v-model="srcEnc" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="utf-8">utf-8</option>
                <option value="utf-16le">utf-16le</option>
                <option value="utf-16be">utf-16be</option>
                <option value="latin1">latin1</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">目标编码</label>
              <select v-model="dstEnc" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="utf-8">utf-8</option>
              </select>
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="asB64" v-model="asBase64" type="checkbox" class="rounded mr-2" />
              <label for="asB64" class="text-sm">下载为 Base64</label>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">转换</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
          <p class="text-xs text-gray-500">说明：浏览器 TextEncoder 仅支持 utf-8 编码；解码支持 utf-8/utf-16le/utf-16be/latin1。目标编码固定为 utf-8。</p>
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
          <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
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
            <div class="font-medium truncate">{{ h.srcEnc }} → {{ h.dstEnc }}</div>
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
import { computed, onMounted, ref } from 'vue'
type HistoryItem = { srcEnc: string; dstEnc: string; summary: string; result: string; timestamp: number }

const inputText = ref('')
const srcEnc = ref<'utf-8' | 'utf-16le' | 'utf-16be' | 'latin1'>('utf-8')
const dstEnc = ref<'utf-8'>('utf-8')
const asBase64 = ref(false)

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

const canProcess = computed(() => inputText.value.length > 0)

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
  const a = document.createElement('a')
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.value)
  a.download = asBase64.value ? 'converted.b64.txt' : 'converted.txt'
  a.click()
}
function saveToHistory() {
  if (!result.value) return
  const summary = (result.value.length > 120 ? result.value.slice(0, 120) + '...' : result.value).replace(/\s+/g, ' ')
  history.value.unshift({ srcEnc: srcEnc.value, dstEnc: dstEnc.value, summary, result: result.value, timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('encoding-history', JSON.stringify(history.value))
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result
  error.value = ''
  processingTime.value = null
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('encoding-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const reader = new FileReader()
  reader.onload = () => {
    const buf = reader.result as ArrayBuffer
    try {
      const txt = new TextDecoder(srcEnc.value as string).decode(buf)
      inputText.value = txt
    } catch {
      alert('此浏览器不支持所选源编码解码')
    }
  }
  reader.readAsArrayBuffer(f)
}

function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const t0 = performance.now()
  try {
    // 统一编码为 utf-8 输出
    const bytes = new TextEncoder().encode(inputText.value)
    if (asBase64.value) {
      let s = ''
      for (const b of bytes) s += String.fromCharCode(b)
      result.value = btoa(s)
    } else {
      result.value = inputText.value
    }
    processingTime.value = Math.round(performance.now() - t0)
  } catch (e: any) {
    error.value = e?.message || '转换失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('encoding-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
