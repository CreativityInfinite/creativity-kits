<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.palette-generator.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.palette-generator.page.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.palette-generator.page.selectAndParams') }} </label>
          <input
            type="file"
            accept="image/*"
            @change="onFile"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div class="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.palette-generator.page.kLabel') }}</label>
              <input v-model.number="k" type="number" min="2" max="16" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.palette-generator.page.stepLabel') }}</label>
              <input v-model.number="step" type="number" min="1" max="10" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.palette-generator.page.process') }}</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.palette-generator.page.output') }} </label>
          <textarea
            :value="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white font-mono text-sm"
            :placeholder="$t('tools.palette-generator.page.resultPlaceholder')"
          />
          <div v-if="colors.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-3">
            <div v-for="(c, i) in colors" :key="i" class="rounded overflow-hidden border dark:border-gray-700">
              <div :style="{ backgroundColor: c.hex }" class="h-16"></div>
              <div class="px-2 py-1 text-xs flex items-center justify-between">
                <span class="font-mono">{{ c.hex }}</span>
                <button @click="copyText(c.hex)" class="px-1 py-0.5 bg-gray-700 hover:bg-gray-800 text-white rounded text-[10px]">{{ $t('tools.palette-generator.page.copyColor') }}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.palette-generator.page.copyResult') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
type Color = { r: number; g: number; b: number; hex: string };
const fileRef = ref<File | null>(null);
const k = ref(6);
const step = ref(3);
const colors = ref<Color[]>([]);
const output = ref('');

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null;
  fileRef.value = f;
  colors.value = [];
  output.value = f ? t('tools.palette-generator.page.selectedFile', { name: f.name }) : '';
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert(t('tools.palette-generator.page.copied')));
}

async function process() {
  colors.value = [];
  output.value = '';
  const f = fileRef.value;
  if (!f) {
    output.value = '请先选择图片';
    return;
  }
  try {
    const url = URL.createObjectURL(f);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(t('tools.palette-generator.page.canvasUnavailable'));
    // 缩放到较小尺寸以提速（最长边不超过 512）
    const scale = Math.min(1, 512 / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pts: number[][] = [];
    const s = Math.max(1, step.value || 1);
    for (let y = 0; y < height; y += s) {
      for (let x = 0; x < width; x += s) {
        const i = (y * width + x) * 4;
        const a = data[i + 3];
        if (a < 10) continue;
        pts.push([data[i], data[i + 1], data[i + 2]]);
      }
    }
    if (!pts.length) throw new Error(t('tools.palette-generator.page.noPixelsSampled'));

    // K-Means (简化，固定迭代)
    const K = Math.max(2, Math.min(16, k.value || 6));
    const centers: number[][] = [];
    const used = new Set<number>();
    while (centers.length < K && used.size < pts.length) {
      const idx = Math.floor(Math.random() * pts.length);
      if (!used.has(idx)) {
        used.add(idx);
        centers.push([...pts[idx]]);
      }
    }
    for (let iter = 0; iter < 8; iter++) {
      const sums = Array.from({ length: K }, () => [0, 0, 0, 0]);
      for (const p of pts) {
        let bi = 0;
        let bd = Infinity;
        for (let c = 0; c < K; c++) {
          const cc = centers[c];
          const d = (p[0] - cc[0]) ** 2 + (p[1] - cc[1]) ** 2 + (p[2] - cc[2]) ** 2;
          if (d < bd) {
            bd = d;
            bi = c;
          }
        }
        sums[bi][0] += p[0];
        sums[bi][1] += p[1];
        sums[bi][2] += p[2];
        sums[bi][3] += 1;
      }
      for (let c = 0; c < K; c++) {
        const cnt = sums[c][3] || 1;
        centers[c][0] = Math.round(sums[c][0] / cnt);
        centers[c][1] = Math.round(sums[c][1] / cnt);
        centers[c][2] = Math.round(sums[c][2] / cnt);
      }
    }
    const list = centers.map(([r, g, b]) => ({ r, g, b, hex: rgbToHex(r, g, b) }));
    colors.value = list;
    output.value = JSON.stringify(list, null, 2);
  } catch (e: any) {
    output.value = t('tools.palette-generator.page.extractFailedPrefix') + (e?.message || String(e));
  }
}

async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.palette-generator.page.copied'));
  } catch (err) {
    console.error(t('tools.palette-generator.page.copyFailedLog'), err);
    alert(t('tools.palette-generator.page.copyFailed'));
  }
}
</script>
