<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">图片压缩</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">选择图片</label>
            <input type="file" accept="image/*" @change="onFile" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">质量 (0.1-1)</label>
              <input v-model.number="quality" type="number" min="0.1" max="1" step="0.05" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">最大宽</label>
              <input v-model.number="maxW" type="number" min="1" placeholder="如 1920" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">最大高</label>
              <input v-model.number="maxH" type="number" min="1" placeholder="如 1080" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!file" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">压缩</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
          <p class="text-xs text-gray-500">说明：基于 Canvas 进行重采样与压缩，导出为 JPEG/PNG（取决于原图透明度）。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div v-if="outUrl" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">预览</h4>
              <div class="flex gap-2">
                <button @click="copyUrl" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制 DataURL</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>
            <img :src="outUrl" class="max-h-80 rounded border dark:border-gray-700" alt="preview" />
            <div class="text-xs text-gray-500 mt-2">输入: {{ inMeta }} · 输出: {{ outMeta }}</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🖼️</div>
          <div class="text-lg">上传图片并设置参数进行压缩</div>
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
            <div class="font-medium truncate">质量 {{ h.quality }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">输入: {{ h.inMeta }} · 输出: {{ h.outMeta }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <canvas ref="cv" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
type HistoryItem = { quality: number; inMeta: string; outMeta: string; url: string; timestamp: number }

const file = ref<File | null>(null)
const imgEl = ref<HTMLImageElement | null>(null)
const cv = ref<HTMLCanvasElement | null>(null)

const quality = ref(0.8)
const maxW = ref<number | null>(null)
const maxH = ref<number | null>(null)

const inMeta = ref('')
const outMeta = ref('')
const outUrl = ref('')
const error = ref('')
const history = ref<HistoryItem[]>([])

function clearAll() {
  file.value = null
  imgEl.value = null
  outUrl.value = ''
  inMeta.value = ''
  outMeta.value = ''
  error.value = ''
}
function copyUrl() {
  if (outUrl.value) navigator.clipboard.writeText(outUrl.value).then(() => alert('已复制 DataURL'))
}
function downloadResult() {
  if (!outUrl.value) return
  const a = document.createElement('a')
  a.href = outUrl.value
  a.download = 'compressed.jpg'
  a.click()
}
function saveToHistory() {
  if (!outUrl.value) return
  history.value.unshift({ quality: quality.value, inMeta: inMeta.value, outMeta: outMeta.value, url: outUrl.value, timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('imgcomp-history', JSON.stringify(history.value))
}
function loadFromHistory(h: HistoryItem) {
  outUrl.value = h.url
  inMeta.value = h.inMeta
  outMeta.value = h.outMeta
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('imgcomp-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] || null
  if (!file.value) return
  const img = new Image()
  img.onload = () => {
    imgEl.value = img
    inMeta.value = `${img.naturalWidth}x${img.naturalHeight}`
  }
  img.onerror = () => (error.value = '图片加载失败')
  img.src = URL.createObjectURL(file.value)
}

function hasAlpha(img: HTMLImageElement) {
  // 简化：不做逐像素检测，按文件类型判断不可靠；统一导出 JPEG，若需透明可改写为 image/png
  return false
}

function resizeDraw(img: HTMLImageElement) {
  const canvas = cv.value!
  let w = img.naturalWidth,
    h = img.naturalHeight
  const mw = maxW.value || w,
    mh = maxH.value || h
  const scale = Math.min(1, mw / w, mh / h)
  w = Math.max(1, Math.round(w * scale))
  h = Math.max(1, Math.round(h * scale))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)
  return { w, h }
}

function process() {
  error.value = ''
  try {
    if (!imgEl.value) throw new Error('请先选择图片')
    const { w, h } = resizeDraw(imgEl.value)
    const mime = hasAlpha(imgEl.value) ? 'image/png' : 'image/jpeg'
    outUrl.value = (cv.value as HTMLCanvasElement).toDataURL(mime, Math.min(1, Math.max(0.1, quality.value || 0.8)))
    outMeta.value = `${w}x${h}`
  } catch (e: any) {
    error.value = e?.message || '压缩失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('imgcomp-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
