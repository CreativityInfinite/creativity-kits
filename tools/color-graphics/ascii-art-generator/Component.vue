<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.ascii-art-generator.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.ascii-art-generator.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-1">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.ascii-art-generator.page.selectImage') }}</label>
        <input type="file" accept="image/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.ascii-art-generator.page.outputWidth') }}</label>
        <input v-model.number="width" type="number" min="10" max="300" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.ascii-art-generator.page.charset') }}</label>
        <input v-model="charset" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="generate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.ascii-art-generator.page.generate') }}</button>
      <button v-if="ascii" @click="copy" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.ascii-art-generator.page.copy') }}</button>
    </div>

    <div v-if="previewUrl || ascii" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.ascii-art-generator.page.preview') }}</div>
        <img :src="previewUrl" alt="preview" class="max-w-full rounded-md border dark:border-gray-700" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.ascii-art-generator.page.asciiOutput') }}</div>
        <pre class="text-xs leading-[0.9rem] whitespace-pre">{{ ascii }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const file = ref<File | null>(null);
const previewUrl = ref('');
const width = ref(80);
const charset = ref(' .:-=+*#%@');
const ascii = ref('');

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  const f = t.files?.[0] || null;
  file.value = f;
  ascii.value = '';
  if (f) {
    previewUrl.value = URL.createObjectURL(f);
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}

async function generate() {
  ascii.value = '';
  if (!previewUrl.value) {
    alert(t('tools.ascii-art-generator.page.alertSelectImage'));
    return;
  }
  const img = await loadImage(previewUrl.value);
  const w = Math.max(10, Math.min(300, Math.floor(width.value || 80)));
  const ratio = img.naturalHeight / img.naturalWidth;
  // 字符的宽高比例通常接近 0.5（终端字体更“窄”）
  const h = Math.max(5, Math.floor(w * ratio * 0.5));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const chars = charset.value || ' .:-=+*#%@';
  const scale = chars.length - 1;
  let out = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      // 亮度估算 (Rec. 709)
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const idx = Math.round((1 - lum / 255) * scale);
      out += chars[idx] || chars[scale];
    }
    out += '\n';
  }
  ascii.value = out;
}

async function copy() {
  if (!ascii.value) return;
  try {
    await navigator.clipboard.writeText(ascii.value);
    alert(t('tools.ascii-art-generator.page.copied'));
  } catch {
    alert(t('tools.ascii-art-generator.page.copyFailed'));
  }
}
</script>
