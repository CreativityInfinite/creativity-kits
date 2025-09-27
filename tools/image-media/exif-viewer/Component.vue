<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">EXIF 信息查看器</h1>
      <p class="text-gray-600 dark:text-gray-400">读取图片拍摄参数与位置信息（浏览器端解析）。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">选择图片</label>
        <input type="file" accept="image/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div v-if="previewUrl">
        <label class="block text-sm font-medium mb-2">预览</label>
        <img :src="previewUrl" class="max-h-48 rounded-md border dark:border-gray-700" />
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="readExif" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">读取 EXIF</button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-700 dark:text-red-200 text-sm">{{ error }}</div>

    <div v-if="meta" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">核心字段</div>
        <ul class="text-sm space-y-1">
          <li><strong>相机</strong>：{{ meta.Make || '—' }} {{ meta.Model || '' }}</li>
          <li><strong>镜头</strong>：{{ meta.LensModel || '—' }}</li>
          <li><strong>拍摄时间</strong>：{{ meta.DateTimeOriginal || meta.CreateDate || '—' }}</li>
          <li><strong>曝光</strong>：{{ meta.ExposureTime || '—' }}s / F{{ meta.FNumber || '—' }} / ISO {{ meta.ISO || '—' }}</li>
          <li><strong>焦距</strong>：{{ meta.FocalLength || '—' }}</li>
          <li><strong>方向</strong>：{{ meta.Orientation || '—' }}</li>
        </ul>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">位置信息</div>
        <div class="text-sm">
          <div>纬度：{{ gps?.lat ?? '—' }}</div>
          <div>经度：{{ gps?.lng ?? '—' }}</div>
        </div>
      </div>
      <div class="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">完整 JSON</div>
        <textarea readonly rows="12" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white">{{ fullJson }}</textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const file = ref<File | null>(null)
const previewUrl = ref('')
const meta = ref<any>(null)
const gps = ref<{ lat: number; lng: number } | null>(null)
const error = ref('')

function onFile(e: Event) {
  const t = e.target as HTMLInputElement
  file.value = t.files?.[0] || null
  previewUrl.value = file.value ? URL.createObjectURL(file.value) : ''
  meta.value = null
  gps.value = null
  error.value = ''
}

const fullJson = computed(() => (meta.value ? JSON.stringify(meta.value, null, 2) : ''))

async function readExif() {
  error.value = ''
  if (!file.value) {
    error.value = '请先选择图片'
    return
  }
  try {
    // @ts-ignore
    const exifr: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.esm.js')
    meta.value = await (exifr as any).parse(file.value)
    const g = await (exifr as any).gps(file.value)
    gps.value = g ? { lat: g.latitude, lng: g.longitude } : null
  } catch (e: any) {
    error.value = e?.message || '解析失败'
  }
}
</script>
