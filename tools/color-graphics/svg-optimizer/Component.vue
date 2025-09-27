<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">SVG 优化器</h1>
      <p class="text-gray-600 dark:text-gray-400">在浏览器本地对 SVG 文本进行简易优化（去注释/空白/无用标签），显示压缩率</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输入 SVG 文本 </label>
          <textarea
            v-model="input"
            rows="10"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="粘贴 SVG 源码..."
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">处理</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输出（Minified） </label>
          <textarea
            :value="output"
            readonly
            rows="10"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white font-mono text-sm"
            placeholder="处理结果将显示在这里..."
          />
          <div v-if="stats" class="text-xs text-gray-500 mt-2">原始: {{ stats.orig }} 字节 · 压缩后: {{ stats.min }} 字节 · 压缩率: {{ stats.ratio }}%</div>
          <div class="flex justify-center mt-3">
            <button @click="downloadSVG" :disabled="!output" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors">下载 SVG</button>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">复制结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const output = ref('')
const stats = ref<{ orig: number; min: number; ratio: number } | null>(null)

function minifySvg(svg: string) {
  let s = svg
  // 去掉 XML 声明、注释
  s = s.replace(/<!--[\s\S]*?-->|<!--[\s\S]*?-->/g, '')
  s = s.replace(/<\?xml[\s\S]*?\?>/gi, '')
  // 移除常见的编辑器元数据标签
  s = s.replace(/<\/?(?:metadata|defs)\b[^>]*>/gi, '')
  // 合并多余空白
  s = s.replace(/\s{2,}/g, ' ')
  s = s.replace(/>\s+</g, '><')
  // 去掉不必要的空属性和空 style
  s = s.replace(/\s(?:id|class|style|data-[\w:-]+)=(["'])\s*\1/g, '')
  // 去掉行首尾空白
  s = s.trim()
  return s
}

function process() {
  const raw = (input.value || '').trim()
  if (!raw) {
    output.value = ''
    stats.value = null
    return
  }
  const origLen = new Blob([raw]).size
  const min = minifySvg(raw)
  const minLen = new Blob([min]).size
  output.value = min
  const ratio = origLen ? Math.round((100 * (origLen - minLen)) / origLen) : 0
  stats.value = { orig: origLen, min: minLen, ratio }
}

async function copyToClipboard() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

function downloadSVG() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'optimized.svg'
  a.click()
  URL.revokeObjectURL(url)
}
</script>
