<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.meme-generator.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.meme-generator.page.selectImage') }}</label>
            <input type="file" accept="image/*" @change="onFile" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.meme-generator.page.topText') }}</label>
              <input v-model="topText" placeholder="TOP TEXT" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.meme-generator.page.bottomText') }}</label>
              <input v-model="bottomText" placeholder="BOTTOM TEXT" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.meme-generator.page.fontSize') }}</label>
              <input v-model.number="fontSize" type="number" min="10" max="200" step="2" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.meme-generator.page.fillColor') }}</label>
              <input v-model="fill" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.meme-generator.page.strokeColor') }}</label>
              <input v-model="stroke" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!img" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.meme-generator.page.generate') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.meme-generator.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.meme-generator.page.resultTitle') }}</h3>

        <div v-if="outUrl" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.meme-generator.page.preview') }}</h4>
              <div class="flex gap-2">
                <button @click="copyUrl" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.meme-generator.page.copyDataUrl') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.meme-generator.page.download') }}</button>
              </div>
            </div>
            <img :src="outUrl" class="max-h-96 rounded border dark:border-gray-700" :alt="$t('tools.meme-generator.page.previewAlt')" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.meme-generator.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">😄</div>
          <div class="text-lg">{{ $t('tools.meme-generator.page.emptyTip') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.meme-generator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.summary }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.meme-generator.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.meme-generator.page.remove') }}</button>
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
const { t } = useI18n();
type HistoryItem = { summary: string; url: string; timestamp: number };

const img = ref<HTMLImageElement | null>(null);
const cv = ref<HTMLCanvasElement | null>(null);

const topText = ref('');
const bottomText = ref('');
const fontSize = ref(48);
const fill = ref('#ffffff');
const stroke = ref('#000000');

const outUrl = ref('');
const error = ref('');
const history = ref<HistoryItem[]>([]);

function clearAll() {
  outUrl.value = '';
  error.value = '';
}
function copyUrl() {
  if (outUrl.value) navigator.clipboard.writeText(outUrl.value).then(() => alert(t('tools.meme-generator.page.copiedDataUrl')));
}
function downloadResult() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = 'meme.png';
  a.click();
}
function saveToHistory() {
  if (!outUrl.value) return;
  history.value.unshift({ summary: `${topText.value} | ${bottomText.value}`.trim(), url: outUrl.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('meme-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  outUrl.value = h.url;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('meme-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const im = new Image();
  im.onload = () => (img.value = im);
  im.onerror = () => (error.value = t('tools.meme-generator.page.imageLoadFailed'));
  im.src = URL.createObjectURL(f);
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${fontSize.value || 48}px Impact, system-ui, sans-serif`;
  if (stroke.value) {
    ctx.strokeStyle = stroke.value;
    ctx.lineWidth = Math.max(2, Math.floor((fontSize.value || 48) / 10));
    ctx.strokeText(text, x, y, maxWidth);
  }
  ctx.fillStyle = fill.value;
  ctx.fillText(text, x, y, maxWidth);
}

function process() {
  error.value = '';
  try {
    if (!img.value) throw new Error(t('tools.meme-generator.page.selectImageFirst'));
    const canvas = cv.value!;
    canvas.width = img.value.naturalWidth;
    canvas.height = img.value.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img.value, 0, 0, canvas.width, canvas.height);
    const margin = Math.max(10, Math.floor((fontSize.value || 48) * 0.6));
    if (topText.value) drawText(ctx, topText.value, canvas.width / 2, margin + (fontSize.value || 48) / 2, canvas.width - margin * 2);
    if (bottomText.value) drawText(ctx, bottomText.value, canvas.width / 2, canvas.height - margin - (fontSize.value || 48) / 2, canvas.width - margin * 2);
    outUrl.value = canvas.toDataURL('image/png');
  } catch (e: any) {
    error.value = e?.message || t('tools.meme-generator.page.generateFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('meme-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
