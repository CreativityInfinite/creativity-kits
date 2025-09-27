<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">SVG 转 PNG</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">尺寸与背景</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">宽度</label>
                <input v-model.number="width" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">高度</label>
                <input v-model.number="height" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">缩放（1-4）</label>
                <input v-model.number="scale" type="number" min="0.1" max="4" step="0.1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">背景色（可空透明）</label>
                <input v-model="background" type="text" placeholder="#ffffff 或 transparent" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">SVG 文本或 URL</label>
            <textarea
              v-model="inputText"
              rows="8"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="输入 SVG 代码，或填写 SVG 文件 URL..."
            />
            <p class="text-xs text-gray-500 mt-1">建议提供 viewBox 以自动推断尺寸；如不提供将使用上面的宽高。</p>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">转换</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换视图</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">处理结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">PNG dataURL</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="6" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>输出长度: {{ result.length }} 字符</div>
              <div v-if="processingTime">处理时间: {{ processingTime }}ms</div>
              <div>最终尺寸: {{ lastInfo.width }} x {{ lastInfo.height }} @ {{ scale }}x</div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">预览</h4>
            <div class="w-full rounded-md border dark:border-gray-700 overflow-auto">
              <img :src="result" alt="preview" class="max-w-full" />
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🖼️</div>
          <div class="text-lg mb-2">SVG 转 PNG</div>
          <div class="text-sm">将 SVG 文本或 URL 转换为 PNG dataURL</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">处理失败</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">操作历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">尺寸 {{ item.width }}x{{ item.height }} · scale {{ item.scale }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.outputLength }} 字符</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制结果</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">提示</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• 优先从 SVG viewBox 推断尺寸；如缺少请在上方指定宽高</div>
        <div>• 背景为空或“transparent”时导出透明 PNG</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type HistoryItem = {
  width: number
  height: number
  scale: number
  background: string
  inputKind: 'svg' | 'url'
  result: string
  outputLength: number
  timestamp: number
}

const width = ref<number | null>(null)
const height = ref<number | null>(null)
const scale = ref(1)
const background = ref('transparent')
const inputText = ref('')

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])
const lastInfo = ref({ width: 0, height: 0 })

const canProcess = computed(() => inputText.value.trim().length > 0)

function clearAll() {
  inputText.value = ''
  result.value = ''
  error.value = ''
  processingTime.value = null
  lastInfo.value = { width: 0, height: 0 }
}

function swapView() {
  if (!result.value) return
  // 本工具仅一种结果类型，这里做一个便捷复制动作
  copyResult()
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板'))
}

function copyResult() {
  if (result.value) copyText(result.value)
}

function downloadResult() {
  if (!result.value) return
  const filename = `svg2png_${new Date().toISOString().slice(0, 10)}.png`
  // 将 dataURL 转为 Blob 下载
  fetch(result.value)
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    })
}

function saveToHistory() {
  if (!result.value) return
  const item: HistoryItem = {
    width: lastInfo.value.width,
    height: lastInfo.value.height,
    scale: scale.value,
    background: background.value,
    inputKind: isProbablyUrl(inputText.value) ? 'url' : 'svg',
    result: result.value,
    outputLength: result.value.length,
    timestamp: Date.now()
  }
  history.value.unshift(item)
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('svg2png-history', JSON.stringify(history.value))
}

function loadFromHistory(item: HistoryItem) {
  width.value = item.width
  height.value = item.height
  scale.value = item.scale
  background.value = item.background
  result.value = item.result
  error.value = ''
  processingTime.value = null
  lastInfo.value = { width: item.width, height: item.height }
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1)
  localStorage.setItem('svg2png-history', JSON.stringify(history.value))
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function isProbablyUrl(s: string) {
  return /^https?:\/\//i.test(s.trim())
}

async function fetchText(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`请求失败: ${res.status}`)
  return await res.text()
}

function parseViewBox(svg: string) {
  const m = svg.match(/viewBox\s*=\s*"([^"]+)"/i) || svg.match(/viewBox\s*=\s*'([^']+)'/i)
  if (!m) return null
  const parts = m[1].trim().split(/\s+/).map(Number)
  if (parts.length === 4) {
    return { minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] }
  }
  return null
}

async function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const start = performance.now()

  try {
    let svgText = inputText.value.trim()
    if (isProbablyUrl(svgText)) {
      svgText = await fetchText(svgText)
    }
    if (!svgText) throw new Error('未获取到 SVG 内容')

    // 创建 Image 使用 dataURL 加载 SVG
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = reject
      im.src = svgUrl
    })

    // 自动尺寸：优先 viewBox，否则取 natural 尺寸
    let targetW = width.value || 0
    let targetH = height.value || 0
    if (!targetW || !targetH) {
      const vb = parseViewBox(svgText)
      if (vb) {
        targetW = Math.round((width.value || vb.w) * (scale.value || 1))
        targetH = Math.round((height.value || vb.h) * (scale.value || 1))
      } else {
        targetW = Math.round((width.value || img.naturalWidth || 512) * (scale.value || 1))
        targetH = Math.round((height.value || img.naturalHeight || 512) * (scale.value || 1))
      }
    } else {
      targetW = Math.round(targetW * (scale.value || 1))
      targetH = Math.round(targetH * (scale.value || 1))
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')!
    if (background.value && background.value.toLowerCase() !== 'transparent') {
      ctx.fillStyle = background.value
      ctx.fillRect(0, 0, targetW, targetH)
    }
    ctx.drawImage(img, 0, 0, targetW, targetH)

    const dataURL = canvas.toDataURL('image/png')
    result.value = dataURL
    lastInfo.value = { width: targetW, height: targetH }
    processingTime.value = Math.round(performance.now() - start)

    URL.revokeObjectURL(svgUrl)
  } catch (e: any) {
    error.value = e?.message || '转换失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('svg2png-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
