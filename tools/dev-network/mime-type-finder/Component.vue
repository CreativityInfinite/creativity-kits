<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">MIME 类型查询</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">文件名或扩展名</label>
            <input v-model="name" placeholder="例如：photo.jpg 或 .json 或 readme.md" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">或上传文件</label>
            <input type="file" @change="onFile" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="process" :disabled="!canProcess" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">处理</button>
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
            <div class="font-medium truncate">{{ h.query }}</div>
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
type HistoryItem = { query: string; summary: string; result: string; timestamp: number }

const name = ref('')
const file = ref<File | null>(null)

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

const canProcess = computed(() => name.value.trim().length > 0 || !!file.value)

function clearAll() {
  result.value = ''
  error.value = ''
  processingTime.value = null
  file.value = null
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
  a.download = 'mime-type.json'
  a.click()
  URL.revokeObjectURL(url)
}
function saveToHistory() {
  if (!result.value) return
  const p = JSON.parse(result.value)
  const summary = `${p.inferred?.mime || '-'} | ${p.file?.type || '-'}`
  history.value.unshift({ query: name.value || file.value?.name || '', summary, result: result.value, timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('mimetype-history', JSON.stringify(history.value))
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result
  error.value = ''
  processingTime.value = null
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('mimetype-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] || null
}

const extMap: Record<string, string> = {
  // 常见类型
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  xml: 'application/xml',
  json: 'application/json',
  js: 'application/javascript',
  mjs: 'application/javascript',
  ts: 'application/typescript',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  avif: 'image/avif',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  pdf: 'application/pdf',
  zip: 'application/zip',
  gz: 'application/gzip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  wasm: 'application/wasm',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf'
}

function inferByName(s: string) {
  const m = s
    .trim()
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/)
  const ext = m?.[1] || s.replace(/^\./, '').toLowerCase()
  if (!ext) return { ext: '', mime: null }
  return { ext, mime: extMap[ext] || null }
}

async function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const t0 = performance.now()
  try {
    const inferred = name.value ? inferByName(name.value) : null
    let fileInfo: any = null
    if (file.value) {
      fileInfo = { name: file.value.name, size: file.value.size, type: file.value.type || null, lastModified: file.value.lastModified }
    }
    result.value = JSON.stringify({ input: { name: name.value || null, hasFile: !!file.value }, inferred, file: fileInfo }, null, 2)
    processingTime.value = Math.round(performance.now() - t0)
  } catch (e: any) {
    error.value = e?.message || '处理失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('mimetype-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
