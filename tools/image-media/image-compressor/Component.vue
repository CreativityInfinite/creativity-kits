<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.image-compressor.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.image-compressor.page.selectImage') }}</label>
            <input type="file" accept="image/*" @change="onFile" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-compressor.page.qualityLabel') }}</label>
              <input v-model.number="quality" type="number" min="0.1" max="1" step="0.05" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-compressor.page.maxWidth') }}</label>
              <input v-model.number="maxW" type="number" min="1" :placeholder="$t('tools.image-compressor.page.placeholderWidth')" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-compressor.page.maxHeight') }}</label>
              <input v-model.number="maxH" type="number" min="1" :placeholder="$t('tools.image-compressor.page.placeholderHeight')" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!file" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">{{ $t('tools.image-compressor.page.compress') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.image-compressor.page.clear') }}</button>
          </div>
          <p class="text-xs text-gray-500">{{ $t('tools.image-compressor.page.note') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.image-compressor.page.resultTitle') }}</h3>

        <div v-if="outUrl" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.image-compressor.page.preview') }}</h4>
              <div class="flex gap-2">
                <button @click="copyUrl" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.image-compressor.page.copyDataUrl') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.image-compressor.page.download') }}</button>
              </div>
            </div>
            <img :src="outUrl" class="max-h-80 rounded border dark:border-gray-700" alt="preview" />
            <div class="text-xs text-gray-500 mt-2">{{ $t('tools.image-compressor.page.inOutMeta', { in: inMeta, out: outMeta }) }}</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.image-compressor.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🖼️</div>
          <div class="text-lg">{{ $t('tools.image-compressor.page.emptyTip') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.image-compressor.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ $t('tools.image-compressor.page.quality') }} {{ h.quality }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ $t('tools.image-compressor.page.inOutMeta', { in: h.inMeta, out: h.outMeta }) }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.image-compressor.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.image-compressor.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>

    <canvas ref="cv" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
type HistoryItem = { quality: number; inMeta: string; outMeta: string; url: string; timestamp: number };

const file = ref<File | null>(null);
const imgEl = ref<HTMLImageElement | null>(null);
const cv = ref<HTMLCanvasElement | null>(null);

const { t } = useI18n();

const quality = ref(0.8);
const maxW = ref<number | null>(null);
const maxH = ref<number | null>(null);

const inMeta = ref('');
const outMeta = ref('');
const outUrl = ref('');
const error = ref('');
const history = ref<HistoryItem[]>([]);

function clearAll() {
  file.value = null;
  imgEl.value = null;
  outUrl.value = '';
  inMeta.value = '';
  outMeta.value = '';
  error.value = '';
}
function copyUrl() {
  if (outUrl.value) navigator.clipboard.writeText(outUrl.value).then(() => alert(t('tools.image-compressor.page.copied')));
}
function downloadResult() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = 'compressed.jpg';
  a.click();
}
function saveToHistory() {
  if (!outUrl.value) return;
  history.value.unshift({ quality: quality.value, inMeta: inMeta.value, outMeta: outMeta.value, url: outUrl.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('imgcomp-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  outUrl.value = h.url;
  inMeta.value = h.inMeta;
  outMeta.value = h.outMeta;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('imgcomp-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] || null;
  if (!file.value) return;
  const img = new Image();
  img.onload = () => {
    imgEl.value = img;
    inMeta.value = `${img.naturalWidth}x${img.naturalHeight}`;
  };
  img.onerror = () => (error.value = t('tools.image-compressor.page.imageLoadFailed'));
  img.src = URL.createObjectURL(file.value);
}

function hasAlpha(img: HTMLImageElement) {
  // 简化：不做逐像素检测，按文件类型判断不可靠；统一导出 JPEG，若需透明可改写为 image/png
  return false;
}

function resizeDraw(img: HTMLImageElement) {
  const canvas = cv.value!;
  let w = img.naturalWidth,
    h = img.naturalHeight;
  const mw = maxW.value || w,
    mh = maxH.value || h;
  const scale = Math.min(1, mw / w, mh / h);
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return { w, h };
}

function process() {
  error.value = '';
  try {
    if (!imgEl.value) throw new Error(t('tools.image-compressor.page.selectImageFirst'));
    const { w, h } = resizeDraw(imgEl.value);
    const mime = hasAlpha(imgEl.value) ? 'image/png' : 'image/jpeg';
    outUrl.value = (cv.value as HTMLCanvasElement).toDataURL(mime, Math.min(1, Math.max(0.1, quality.value || 0.8)));
    outMeta.value = `${w}x${h}`;
  } catch (e: any) {
    error.value = e?.message || t('tools.image-compressor.page.compressFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('imgcomp-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
