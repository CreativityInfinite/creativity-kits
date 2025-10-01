<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.open-graph-image-generator.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.open-graph-image-generator.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.canvasWidth') }}</label>
        <input v-model.number="w" type="number" min="600" max="2400" step="10" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.canvasHeight') }}</label>
        <input v-model.number="h" type="number" min="315" max="1260" step="5" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.backgroundColor') }}</label>
        <input v-model="bg" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.titleLabel') }}</label>
        <input
          v-model="title"
          type="text"
          :placeholder="$t('tools.open-graph-image-generator.page.titlePlaceholder')"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.titleColor') }}</label>
        <input v-model="titleColor" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.subtitleLabel') }}</label>
        <input
          v-model="subtitle"
          type="text"
          :placeholder="$t('tools.open-graph-image-generator.page.subtitlePlaceholder')"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.subtitleColor') }}</label>
        <input v-model="subtitleColor" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.logoLabel') }}</label>
        <input type="file" accept="image/*" @change="onLogo" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.logoSize') }}</label>
        <input v-model.number="logoSize" type="number" min="32" max="512" step="4" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.open-graph-image-generator.page.padding') }}</label>
        <input v-model.number="padding" type="number" min="0" max="200" step="4" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="generate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.open-graph-image-generator.page.generatePng') }}</button>
      <button v-if="outUrl" @click="download" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.open-graph-image-generator.page.download') }}</button>
    </div>

    <div v-if="outUrl" class="bg-white dark:bg-gray-800 rounded-lg p-4 border text-center">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.open-graph-image-generator.page.preview') }}</div>
      <img :src="outUrl" class="inline-block max-w-full rounded-md border dark:border-gray-700" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const w = ref(1200);
const h = ref(630);
const bg = ref('#0ea5e9');
const title = ref(t('tools.open-graph-image-generator.page.defaultTitle'));
const subtitle = ref(t('tools.open-graph-image-generator.page.defaultSubtitle'));
const titleColor = ref('#ffffff');
const subtitleColor = ref('#e2e8f0');
const logoFile = ref<File | null>(null);
const logoSize = ref(96);
const padding = ref(64);
const outUrl = ref('');
const logoUrl = ref('');

function onLogo(e: Event) {
  const t = e.target as HTMLInputElement;
  logoFile.value = t.files?.[0] || null;
  logoUrl.value = logoFile.value ? URL.createObjectURL(logoFile.value) : '';
  outUrl.value = '';
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(t('tools.open-graph-image-generator.page.imageLoadFailed')));
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number) {
  const words = text.split(/(\s+)/);
  let line = '';
  const lines: string[] = [];
  for (const w of words) {
    const t = line + w;
    if (ctx.measureText(t).width > maxWidth && line) {
      lines.push(line.trim());
      line = w.trim();
    } else {
      line = t;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.map((s, i) => ({ text: s, offsetY: i * lineHeight }));
}

async function generate() {
  outUrl.value = '';
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(300, w.value || 1200);
  canvas.height = Math.max(200, h.value || 630);
  const ctx = canvas.getContext('2d')!;

  // 背景填充
  ctx.fillStyle = bg.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 文本区域
  const innerW = canvas.width - padding.value * 2;
  let y = padding.value;

  // Logo
  if (logoUrl.value) {
    const img = await loadImage(logoUrl.value);
    const size = Math.min(logoSize.value, innerW);
    ctx.drawImage(img, canvas.width - padding.value - size, padding.value, size, size);
  }

  // 标题
  ctx.fillStyle = titleColor.value;
  ctx.font = '700 64px ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto';
  ctx.textBaseline = 'top';
  const titleLines = wrapText(ctx, title.value || '', innerW, 72);
  titleLines.forEach((ln) => ctx.fillText(ln.text, padding.value, y + ln.offsetY));
  y += titleLines.length * 72 + 12;

  // 副标题
  if (subtitle.value) {
    ctx.fillStyle = subtitleColor.value;
    ctx.font = '400 36px ui-sans-serif, -apple-system, system-ui, Segoe UI, Roboto';
    const subLines = wrapText(ctx, subtitle.value, innerW, 44);
    subLines.forEach((ln) => ctx.fillText(ln.text, padding.value, y + ln.offsetY));
  }

  outUrl.value = canvas.toDataURL('image/png');
}

function download() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = t('tools.open-graph-image-generator.page.downloadFileName');
  a.click();
}
</script>
