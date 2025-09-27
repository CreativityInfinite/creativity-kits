<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">PDF 合并器</h1>
      <p class="text-gray-600 dark:text-gray-400">选择多个 PDF 并在浏览器本地合并为一个文件（文件不上传）</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 选择 PDF 文件 </label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            @change="onFiles"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div v-if="files.length" class="space-y-2 mt-3">
            <div v-for="(f, i) in files" :key="i" class="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
              <div class="truncate">{{ f.name }}（{{ formatSize(f.size) }}）</div>
              <div class="flex gap-2">
                <button @click="moveUp(i)" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">上移</button>
                <button @click="moveDown(i)" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">下移</button>
                <button @click="removeAt(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">移除</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">处理</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输出 </label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            placeholder="处理结果将显示在这里..."
          />
        </div>

        <div class="flex justify-center gap-2">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">复制结果</button>
          <button @click="downloadMerged" :disabled="!downloadUrl" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors">下载 PDF</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

const files = ref<File[]>([])
const output = ref('')
const downloadUrl = ref<string>('')
const merging = ref(false)
const error = ref('')

function onFiles(e: Event) {
  const list = (e.target as HTMLInputElement).files
  files.value = list ? Array.from(list) : []
  clearDownload()
  output.value = files.value.length ? `已选择 ${files.value.length} 个文件` : ''
}
function moveUp(i: number) {
  if (i <= 0) return
  const arr = files.value.slice()
  ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
  files.value = arr
}
function moveDown(i: number) {
  if (i >= files.value.length - 1) return
  const arr = files.value.slice()
  ;[arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]
  files.value = arr
}
function removeAt(i: number) {
  const arr = files.value.slice()
  arr.splice(i, 1)
  files.value = arr
  if (!files.value.length) clearDownload()
}
function formatSize(n: number) {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1024 / 1024).toFixed(1) + ' MB'
}
function clearDownload() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value)
    downloadUrl.value = ''
  }
}

async function process() {
  error.value = ''
  output.value = ''
  clearDownload()
  if (!files.value.length) {
    output.value = '请先选择至少一个 PDF 文件'
    return
  }
  merging.value = true
  const t0 = performance.now()
  try {
    let PDFDocument: any
    try {
      ;({ PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1?bundle'))
    } catch {
      ;({ PDFDocument } = await import('https://cdn.skypack.dev/pdf-lib@1.17.1'))
    }
    const merged = await PDFDocument.create()
    let totalPages = 0
    for (const f of files.value) {
      const buf = await f.arrayBuffer()
      const doc = await PDFDocument.load(buf)
      const pageIndices = doc.getPageIndices()
      totalPages += pageIndices.length
      const copied = await merged.copyPages(doc, pageIndices)
      for (const p of copied) merged.addPage(p)
    }
    const bytes = await merged.save()
    const blob = new Blob([bytes], { type: 'application/pdf' })
    downloadUrl.value = URL.createObjectURL(blob)
    const ms = Math.round(performance.now() - t0)
    output.value = `合并完成：文件 ${files.value.length} 个，共 ${totalPages} 页，用时 ${ms}ms`
  } catch (e: any) {
    console.error(e)
    output.value = '合并失败：' + (e?.message || String(e))
  } finally {
    merging.value = false
  }
}

function downloadMerged() {
  if (!downloadUrl.value) return
  const a = document.createElement('a')
  const date = new Date()
  const y = date.getFullYear().toString().padStart(4, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  a.href = downloadUrl.value
  a.download = `merged_${y}${m}${d}.pdf`
  a.click()
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

onUnmounted(() => clearDownload())
</script>
