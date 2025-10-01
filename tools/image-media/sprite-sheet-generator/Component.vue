<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.sprite-sheet-generator.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.sprite-sheet-generator.page.selectMultipleImages') }}</label>
            <input type="file" accept="image/*" multiple @change="onFiles" />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.sprite-sheet-generator.page.cols') }}</label>
              <input v-model.number="cols" type="number" min="1" step="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.sprite-sheet-generator.page.gapPx') }}</label>
              <input v-model.number="gap" type="number" min="0" step="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.sprite-sheet-generator.page.background') }}</label>
              <input v-model="bg" type="color" class="w-full h-[42px] px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!items.length" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.sprite-sheet-generator.page.generate') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.sprite-sheet-generator.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.sprite-sheet-generator.page.resultTitle') }}</h3>

        <div v-if="outUrl" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.sprite-sheet-generator.page.preview') }}</h4>
              <div class="flex gap-2">
                <button @click="copyUrl" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.sprite-sheet-generator.page.copyDataUrl') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.sprite-sheet-generator.page.download') }}</button>
              </div>
            </div>
            <img :src="outUrl" class="max-h-96 rounded border dark:border-gray-700" alt="preview" />
            <div class="text-xs text-gray-500 mt-2">{{ $t('tools.sprite-sheet-generator.page.size') }}: {{ sheetMeta }}</div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.sprite-sheet-generator.page.mappingJson') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
                  {{ $t('tools.sprite-sheet-generator.page.copy') }}
                </button>
                <button @click="downloadJson" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
                  {{ $t('tools.sprite-sheet-generator.page.download') }}
                </button>
              </div>
            </div>
            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.sprite-sheet-generator.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🧩</div>
          <div class="text-lg">{{ $t('tools.sprite-sheet-generator.page.emptyTip') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.sprite-sheet-generator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ $t('tools.sprite-sheet-generator.page.historyItemTitle', { count: h.count, cols: h.cols }) }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ $t('tools.sprite-sheet-generator.page.size') }}: {{ h.sheetMeta }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.sprite-sheet-generator.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.sprite-sheet-generator.page.remove') }}</button>
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
type HistoryItem = { count: number; cols: number; sheetMeta: string; url: string; json: string; timestamp: number };

const { t } = useI18n();

type Item = { name: string; image: HTMLImageElement; w: number; h: number };
const items = ref<Item[]>([]);
const cols = ref(4);
const gap = ref(2);
const bg = ref('#00000000');

const cv = ref<HTMLCanvasElement | null>(null);
const outUrl = ref('');
const sheetMeta = ref('');
const result = ref('');
const error = ref('');
const history = ref<HistoryItem[]>([]);

function clearAll() {
  items.value = [];
  outUrl.value = '';
  result.value = '';
  sheetMeta.value = '';
  error.value = '';
}
function copyUrl() {
  if (outUrl.value) navigator.clipboard.writeText(outUrl.value).then(() => alert(t('tools.sprite-sheet-generator.page.copyDataUrl')));
}
function downloadResult() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = 'sprite.png';
  a.click();
}
function copyResult() {
  if (result.value) navigator.clipboard.writeText(result.value).then(() => alert(t('tools.sprite-sheet-generator.page.copy')));
}
function downloadJson() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sprite.json';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!outUrl.value || !result.value) return;
  history.value.unshift({ count: items.value.length, cols: cols.value, sheetMeta: sheetMeta.value, url: outUrl.value, json: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('sprite-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  outUrl.value = h.url;
  result.value = h.json;
  sheetMeta.value = h.sheetMeta;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('sprite-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function onFiles(e: Event) {
  const fl = Array.from((e.target as HTMLInputElement).files || []);
  if (!fl.length) return;
  items.value = [];
  let loaded = 0;
  for (const f of fl) {
    const img = new Image();
    img.onload = () => {
      items.value.push({ name: f.name, image: img, w: img.naturalWidth, h: img.naturalHeight });
      loaded++;
    };
    img.onerror = () => (error.value = t('tools.sprite-sheet-generator.page.imageLoadFailed'));
    img.src = URL.createObjectURL(f);
  }
}

function process() {
  error.value = '';
  outUrl.value = '';
  result.value = '';
  try {
    if (!items.value.length) throw new Error(t('tools.sprite-sheet-generator.page.selectImagesFirst'));
    const c = Math.max(1, cols.value | 0);
    const rows = Math.ceil(items.value.length / c);
    // 采用各自尺寸，网格以单元最大宽高为准（简单策略）
    const cellW = Math.max(...items.value.map((i) => i.w));
    const cellH = Math.max(...items.value.map((i) => i.h));
    const W = c * cellW + (c - 1) * gap.value;
    const H = rows * cellH + (rows - 1) * gap.value;
    const canvas = cv.value!;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    if (bg.value && bg.value !== '#00000000') {
      ctx.fillStyle = bg.value;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
    const mapping: Record<string, { x: number; y: number; w: number; h: number; row: number; col: number }> = {};
    for (let i = 0; i < items.value.length; i++) {
      const r = Math.floor(i / c),
        col = i % c;
      const x = col * (cellW + gap.value);
      const y = r * (cellH + gap.value);
      const it = items.value[i];
      const dx = x + Math.floor((cellW - it.w) / 2);
      const dy = y + Math.floor((cellH - it.h) / 2);
      ctx.drawImage(it.image, dx, dy);
      mapping[it.name] = { x, y, w: it.w, h: it.h, row: r, col };
    }
    outUrl.value = canvas.toDataURL('image/png');
    result.value = JSON.stringify({ sheet: { width: W, height: H }, cell: { width: cellW, height: cellH, gap: gap.value, cols: c }, mapping }, null, 2);
    sheetMeta.value = `${W}x${H} (cell ${cellW}x${cellH}, cols ${c})`;
  } catch (e: any) {
    error.value = e?.message || t('tools.sprite-sheet-generator.page.generateFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('sprite-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
