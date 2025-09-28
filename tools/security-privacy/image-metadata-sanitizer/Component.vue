<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">图片元数据清理器</h1>
      <p class="text-gray-600 dark:text-gray-400">离线在浏览器中去除图片 EXIF 信息：通过 Canvas 重绘并导出干净的 PNG。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">选择图片</label>
        <input type="file" accept="image/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">或图片 URL（可选，需允许跨域）</label>
        <input v-model="imageUrl" type="url" placeholder="https://example.com/image.jpg" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="sanitize" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">开始清理</button>
      <button v-if="cleanDataUrl" @click="download" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">下载 PNG</button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-700 dark:text-red-200 text-sm">{{ error }}</div>

    <div v-if="previewUrl || cleanDataUrl" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">原图</div>
        <img :src="previewUrl" alt="original" class="max-w-full rounded-md border dark:border-gray-700" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">清理后的 PNG</div>
        <img :src="cleanDataUrl" alt="cleaned" class="max-w-full rounded-md border dark:border-gray-700" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const file = ref<File | null>(null);
const imageUrl = ref('');
const previewUrl = ref('');
const cleanDataUrl = ref('');
const error = ref('');

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  const f = t.files?.[0] || null;
  file.value = f;
  error.value = '';
  cleanDataUrl.value = '';
  if (f) {
    previewUrl.value = URL.createObjectURL(f);
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败（可能受跨域限制）'));
    img.src = src;
  });
}

async function sanitize() {
  error.value = '';
  cleanDataUrl.value = '';
  let src = '';
  if (file.value) {
    src = previewUrl.value;
  } else if (imageUrl.value.trim()) {
    src = imageUrl.value.trim();
  } else {
    error.value = '请先选择图片或输入图片 URL';
    return;
  }

  try {
    const img = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 不可用');
    ctx.drawImage(img, 0, 0);
    cleanDataUrl.value = canvas.toDataURL('image/png');
  } catch (e: any) {
    error.value = e?.message || String(e);
  }
}

function download() {
  if (!cleanDataUrl.value) return;
  const a = document.createElement('a');
  a.href = cleanDataUrl.value;
  a.download = 'sanitized.png';
  a.click();
}
</script>
