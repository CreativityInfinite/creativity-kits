<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">地图快照生成器</h1>
      <p class="text-gray-600 dark:text-gray-400">从上传的地图图片或图片 URL 生成快照，叠加标题/副标题并导出 PNG。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">上传地图图片</label>
        <input type="file" accept="image/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">或图片 URL</label>
        <input v-model="imgUrl" type="url" placeholder="https://example.com/map.png" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">叠加背景色</label>
        <input v-model="overlay" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">标题</label>
        <input v-model="title" type="text" placeholder="快照标题" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div class="md:col-span-1">
        <label class="block text-sm font-medium mb-2">是否显示日期</label>
        <select v-model="showDate" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option :value="true">显示</option>
          <option :value="false">不显示</option>
        </select>
      </div>

      <div class="md:col-span-3">
        <label class="block text-sm font-medium mb-2">副标题</label>
        <input v-model="subtitle" type="text" placeholder="可选副标题" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="generate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">生成快照</button>
      <button v-if="outUrl" @click="download" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">下载 PNG</button>
    </div>

    <div v-if="previewUrl || outUrl" class="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">源图片</div>
        <img :src="previewUrl" class="max-w-full rounded-md border dark:border-gray-700" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border text-center">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">生成结果</div>
        <img :src="outUrl" class="inline-block max-w-full rounded-md border dark:border-gray-700" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const file = ref<File | null>(null);
const imgUrl = ref('');
const previewUrl = ref('');
const outUrl = ref('');
const overlay = ref('#000000');
const title = ref('地图快照');
const subtitle = ref('');
const showDate = ref(true);

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  file.value = t.files?.[0] || null;
  previewUrl.value = file.value ? URL.createObjectURL(file.value) : '';
  outUrl.value = '';
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败（可能跨域）'));
    img.src = src;
  });
}

async function generate() {
  outUrl.value = '';
  const src = previewUrl.value || imgUrl.value.trim();
  if (!src) {
    alert('请上传图片或输入图片 URL');
    return;
  }
  const img = await loadImage(src);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(img, 0, 0);

  // 顶部半透明条
  ctx.fillStyle = hexToRgba(overlay.value, 0.35);
  const barH = Math.max(60, Math.floor(canvas.height * 0.14));
  ctx.fillRect(0, 0, canvas.width, barH);

  // 文本
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  ctx.font = '700 36px ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto';
  ctx.fillText(title.value || '', 24, 16);

  ctx.font = '400 22px ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto';
  let y = 16 + 44;
  if (subtitle.value) {
    ctx.fillText(subtitle.value, 24, y);
    y += 32;
  }
  if (showDate.value) {
    const ds = new Date().toLocaleString();
    ctx.fillText(ds, 24, y);
  }

  outUrl.value = canvas.toDataURL('image/png');
}

function hexToRgba(hex: string, alpha = 1) {
  const m = hex.replace('#', '');
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function download() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = 'map-snapshot.png';
  a.click();
}
</script>
