<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.favicon-generator.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.favicon-generator.page.textOrEmoji') }}</label>
              <input
                v-model="text"
                :placeholder="$t('tools.favicon-generator.page.textPlaceholder')"
                maxlength="2"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.favicon-generator.page.background') }}</label>
              <input
                v-model="bg"
                :placeholder="$t('tools.favicon-generator.page.backgroundPlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.favicon-generator.page.textColor') }}</label>
              <input v-model="color" placeholder="#000000" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.favicon-generator.page.fontSize') }}</label>
              <input v-model.number="fontSize" type="number" min="8" max="256" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.favicon-generator.page.sizes') }}</label>
              <input
                v-model="sizesInput"
                :placeholder="$t('tools.favicon-generator.page.sizesPlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.favicon-generator.page.generate') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.favicon-generator.page.clear') }}</button>
          </div>

          <p class="text-xs text-gray-500">{{ $t('tools.favicon-generator.page.tip') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.favicon-generator.page.resultTitle') }}</h3>

        <div v-if="items.length" class="space-y-4">
          <div v-for="it in items" :key="it.size" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ it.size }}x{{ it.size }} PNG</h4>
              <div class="flex gap-2">
                <button @click="copyDataUrl(it.dataUrl)" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.favicon-generator.page.copyDataUrl') }}</button>
                <button @click="download(it)" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.favicon-generator.page.download') }}</button>
              </div>
            </div>
            <img :src="it.dataUrl" :alt="`favicon-${it.size}`" class="w-16 h-16 border rounded-md bg-white dark:bg-gray-700" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.favicon-generator.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🧩</div>
          <div class="text-lg">{{ $t('tools.favicon-generator.page.emptyTip') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.favicon-generator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium">{{ $t('tools.favicon-generator.page.sizesLabel') }} {{ h.sizes.join(',') }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">
            {{ $t('tools.favicon-generator.page.textOrEmoji') }}: {{ h.text }} · {{ $t('tools.favicon-generator.page.textColor') }}: {{ h.color }} ·
            {{ $t('tools.favicon-generator.page.background') }}: {{ h.bg }}
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.favicon-generator.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.favicon-generator.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type IconItem = { size: number; dataUrl: string };
type HistoryItem = { text: string; color: string; bg: string; sizes: number[]; timestamp: number; items: IconItem[] };

const { t } = useI18n();
const text = ref('😀');
const color = ref('#000000');
const bg = ref('#ffffff00');
const fontSize = ref(64);
const sizesInput = ref('16,32,48,64,180');

const items = ref<IconItem[]>([]);
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => !!(text.value || '').trim());

function clearAll() {
  items.value = [];
  error.value = '';
  processingTime.value = null;
}
function copyDataUrl(u: string) {
  navigator.clipboard.writeText(u).then(() => alert(t('tools.favicon-generator.page.copiedDataUrl')));
}
function download(it: IconItem) {
  const name = `favicon-${it.size}.png`;
  const a = document.createElement('a');
  a.href = it.dataUrl;
  a.download = name;
  a.click();
}
function saveToHistory() {
  if (!items.value.length) return;
  const sizes = items.value.map((x) => x.size);
  history.value.unshift({ text: text.value, color: color.value, bg: bg.value, sizes, timestamp: Date.now(), items: items.value.slice(0, 3) });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('favicon-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  text.value = h.text;
  color.value = h.color;
  bg.value = h.bg;
  sizesInput.value = h.sizes.join(',');
  items.value = h.items; // 仅预览前几张
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('favicon-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function drawIcon(size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // 背景
  if (bg.value && bg.value !== 'transparent' && bg.value !== '#ffffff00') {
    ctx.fillStyle = bg.value;
    ctx.fillRect(0, 0, size, size);
  } else {
    // 透明背景，绘制网格以便预览对比（导出仍透明）
    // 跳过网格，直接透明导出即可
  }
  // 文本
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = color.value || '#000';
  ctx.font = `bold ${Math.min(fontSize.value, size * 0.8)}px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif`;
  ctx.fillText(text.value || '', size / 2, size / 2);
  return canvas.toDataURL('image/png');
}

function parseSizes(): number[] {
  const arr = sizesInput.value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 1024);
  const uniq = Array.from(new Set(arr));
  return uniq.sort((a, b) => a - b);
}

function process() {
  error.value = '';
  items.value = [];
  processingTime.value = null;
  const start = performance.now();
  try {
    const sizes = parseSizes();
    if (!sizes.length) throw new Error(t('tools.favicon-generator.page.invalidSizes'));
    items.value = sizes.map((sz) => ({ size: sz, dataUrl: drawIcon(sz) }));
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.favicon-generator.page.generateFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('favicon-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
