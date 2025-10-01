<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.color-blindness-simulator.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.color-blindness-simulator.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.color-blindness-simulator.page.selectImage') }}</label>
        <input type="file" accept="image/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.color-blindness-simulator.page.defectType') }}</label>
        <select v-model="mode" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value="protanopia">Protanopia（红弱/红色盲）</option>
          <option value="deuteranopia">Deuteranopia（绿弱/绿色盲）</option>
          <option value="tritanopia">Tritanopia（蓝黄弱/蓝色盲）</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.color-blindness-simulator.page.intensity') }}</label>
        <input v-model.number="intensity" type="number" step="0.1" min="0" max="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="simulate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.color-blindness-simulator.page.simulate') }}</button>
    </div>

    <div v-if="previewUrl || outUrl" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.color-blindness-simulator.page.originalImage') }}</div>
        <img :src="previewUrl" alt="original" class="max-w-full rounded-md border dark:border-gray-700" />
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.color-blindness-simulator.page.simulatedResult') }}</div>
        <img :src="outUrl" alt="simulated" class="max-w-full rounded-md border dark:border-gray-700" />
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
const outUrl = ref('');
const mode = ref<'protanopia' | 'deuteranopia' | 'tritanopia'>('protanopia');
const intensity = ref(1);

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  const f = t.files?.[0] || null;
  file.value = f;
  outUrl.value = '';
  if (f) previewUrl.value = URL.createObjectURL(f);
}

async function simulate() {
  outUrl.value = '';
  if (!previewUrl.value) {
    alert(t('tools.color-blindness-simulator.page.alertSelectImage'));
    return;
  }
  const img = await loadImage(previewUrl.value);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  const m = getMatrix(mode.value);
  const a = Math.max(0, Math.min(1, intensity.value || 1));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const nr = m[0][0] * r + m[0][1] * g + m[0][2] * b;
    const ng = m[1][0] * r + m[1][1] * g + m[1][2] * b;
    const nb = m[2][0] * r + m[2][1] * g + m[2][2] * b;
    data[i] = Math.round(r * (1 - a) + nr * a);
    data[i + 1] = Math.round(g * (1 - a) + ng * a);
    data[i + 2] = Math.round(b * (1 - a) + nb * a);
  }

  ctx.putImageData(image, 0, 0);
  outUrl.value = canvas.toDataURL('image/png');
}

function getMatrix(type: 'protanopia' | 'deuteranopia' | 'tritanopia'): number[][] {
  switch (type) {
    case 'protanopia':
      return [
        [0.56667, 0.43333, 0.0],
        [0.55833, 0.44167, 0.0],
        [0.0, 0.24167, 0.75833]
      ];
    case 'deuteranopia':
      return [
        [0.625, 0.375, 0.0],
        [0.7, 0.3, 0.0],
        [0.0, 0.3, 0.7]
      ];
    case 'tritanopia':
      return [
        [0.95, 0.05, 0.0],
        [0.0, 0.433, 0.567],
        [0.0, 0.475, 0.525]
      ];
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}
</script>
