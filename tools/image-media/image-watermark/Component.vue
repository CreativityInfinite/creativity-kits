<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.image-watermark.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.selectBase') }}</label>
            <input type="file" accept="image/*" @change="onBaseFile" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.wmType') }}</label>
              <select v-model="wmType" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="text">{{ $t('tools.image-watermark.page.wmTypeText') }}</option>
                <option value="image">{{ $t('tools.image-watermark.page.wmTypeImage') }}</option>
              </select>
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="tile" v-model="tiled" type="checkbox" class="rounded mr-2" />
              <label for="tile" class="text-sm">{{ $t('tools.image-watermark.page.tiled') }}</label>
            </div>
          </div>

          <div v-if="wmType === 'text'" class="space-y-2">
            <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.wmText') }}</label>
            <input
              v-model="wmText"
              :placeholder="$t('tools.image-watermark.page.wmTextPlaceholder')"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.fontSize') }}</label>
                <input v-model.number="fontSize" type="number" min="8" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.fillColor') }}</label>
                <input v-model="fill" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.strokeColor') }}</label>
                <input v-model="stroke" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
          </div>

          <div v-else class="space-y-2">
            <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.selectWmImage') }}</label>
            <input type="file" accept="image/*" @change="onWatermarkFile" />
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.imgScale') }}</label>
              <input v-model.number="imgScale" type="number" min="1" max="100" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.position') }}</label>
              <select v-model="position" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="center">{{ $t('tools.image-watermark.page.posCenter') }}</option>
                <option value="top-left">{{ $t('tools.image-watermark.page.posTopLeft') }}</option>
                <option value="top-right">{{ $t('tools.image-watermark.page.posTopRight') }}</option>
                <option value="bottom-left">{{ $t('tools.image-watermark.page.posBottomLeft') }}</option>
                <option value="bottom-right">{{ $t('tools.image-watermark.page.posBottomRight') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.opacity') }}</label>
              <input v-model.number="opacity" type="number" min="0" max="1" step="0.05" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.image-watermark.page.offsetPx') }}</label>
              <input v-model.number="offset" type="number" min="0" step="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!baseImg" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.image-watermark.page.process') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.image-watermark.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.image-watermark.page.resultTitle') }}</h3>

        <div v-if="outUrl" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.image-watermark.page.preview') }}</h4>
              <div class="flex gap-2">
                <button @click="copyUrl" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.image-watermark.page.copyDataUrl') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.image-watermark.page.download') }}</button>
              </div>
            </div>
            <img :src="outUrl" class="max-h-80 rounded border dark:border-gray-700" :alt="$t('tools.image-watermark.page.previewAlt')" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.image-watermark.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">💧</div>
          <div class="text-lg">{{ $t('tools.image-watermark.page.emptyTip') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.image-watermark.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.position }} · {{ h.type }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ $t('tools.image-watermark.page.opacityShort') }}: {{ h.opacity }} {{ $t('tools.image-watermark.page.offsetShort') }}: {{ h.offset }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.image-watermark.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.image-watermark.page.remove') }}</button>
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
type HistoryItem = { type: 'text' | 'image'; position: string; opacity: number; offset: number; url: string; timestamp: number };

const baseImg = ref<HTMLImageElement | null>(null);
const wmImg = ref<HTMLImageElement | null>(null);
const cv = ref<HTMLCanvasElement | null>(null);

const wmType = ref<'text' | 'image'>('text');
const wmText = ref('FancyTools');
const fontSize = ref(32);
const fill = ref('#ffffff');
const stroke = ref('#000000');
const imgScale = ref(20); // watermark image width as % of base width
const tiled = ref(false);

const position = ref<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
const opacity = ref(0.5);
const offset = ref(16);

const outUrl = ref('');
const error = ref('');
const history = ref<HistoryItem[]>([]);

const { t } = useI18n();

function clearAll() {
  outUrl.value = '';
  error.value = '';
  wmImg.value = null;
}
function copyUrl() {
  if (outUrl.value) navigator.clipboard.writeText(outUrl.value).then(() => alert(t('tools.image-watermark.page.copiedDataUrl')));
}
function downloadResult() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = 'watermark.png';
  a.click();
}
function saveToHistory() {
  if (!outUrl.value) return;
  history.value.unshift({ type: wmType.value, position: position.value, opacity: opacity.value, offset: offset.value, url: outUrl.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('wm-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  outUrl.value = h.url;
  position.value = h.position as any;
  opacity.value = h.opacity;
  offset.value = h.offset;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('wm-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function onBaseFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const img = new Image();
  img.onload = () => (baseImg.value = img);
  img.onerror = () => (error.value = t('tools.image-watermark.page.baseLoadFailed'));
  img.src = URL.createObjectURL(f);
}
function onWatermarkFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const img = new Image();
  img.onload = () => (wmImg.value = img);
  img.onerror = () => (error.value = t('tools.image-watermark.page.wmLoadFailed'));
  img.src = URL.createObjectURL(f);
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.globalAlpha = Math.min(1, Math.max(0, opacity.value || 0.5));
  if (wmType.value === 'text') {
    ctx.font = `bold ${fontSize.value || 32}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = wmText.value || '';
    const drawAt = (x: number, y: number) => {
      if (stroke.value) {
        ctx.strokeStyle = stroke.value;
        ctx.lineWidth = Math.max(1, Math.floor((fontSize.value || 32) / 12));
        ctx.strokeText(text, x, y);
      }
      ctx.fillStyle = fill.value || '#fff';
      ctx.fillText(text, x, y);
    };
    if (tiled.value) {
      const stepX = Math.max(80, fontSize.value * 4),
        stepY = Math.max(80, fontSize.value * 2.5);
      for (let y = offset.value; y < h; y += stepY) {
        for (let x = offset.value; x < w; x += stepX) {
          drawAt(x, y);
        }
      }
    } else {
      const { x, y } = anchor(w, h, offset.value, offset.value);
      drawAt(x, y);
    }
  } else {
    if (!wmImg.value) return;
    const ww = Math.round(w * (Math.min(100, Math.max(1, imgScale.value)) / 100));
    const ratio = wmImg.value.naturalHeight / wmImg.value.naturalWidth;
    const hh = Math.round(ww * ratio);
    const drawAt = (x: number, y: number) => ctx.drawImage(wmImg.value!, x - ww / 2, y - hh / 2, ww, hh);
    if (tiled.value) {
      const stepX = ww + Math.max(32, offset.value),
        stepY = hh + Math.max(32, offset.value);
      for (let y = stepY / 2; y < h; y += stepY) {
        for (let x = stepX / 2; x < w; x += stepX) {
          drawAt(x, y);
        }
      }
    } else {
      const { x, y } = anchor(w, h, offset.value, offset.value);
      drawAt(x, y);
    }
  }
  ctx.globalAlpha = 1;
}
function anchor(w: number, h: number, ox: number, oy: number) {
  let x = w / 2,
    y = h / 2;
  if (position.value === 'top-left') {
    x = ox;
    y = oy;
  } else if (position.value === 'top-right') {
    x = w - ox;
    y = oy;
  } else if (position.value === 'bottom-left') {
    x = ox;
    y = h - oy;
  } else if (position.value === 'bottom-right') {
    x = w - ox;
    y = h - oy;
  }
  return { x, y };
}

function process() {
  error.value = '';
  try {
    if (!baseImg.value) throw new Error(t('tools.image-watermark.page.selectBaseFirst'));
    const canvas = cv.value!;
    canvas.width = baseImg.value.naturalWidth;
    canvas.height = baseImg.value.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(baseImg.value, 0, 0, canvas.width, canvas.height);
    drawWatermark(ctx, canvas.width, canvas.height);
    outUrl.value = canvas.toDataURL('image/png');
  } catch (e: any) {
    error.value = e?.message || t('tools.image-watermark.page.processFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('wm-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
