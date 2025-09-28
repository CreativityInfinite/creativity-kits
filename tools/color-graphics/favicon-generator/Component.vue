<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Favicon 生成器 (PNG)</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">文本/Emoji</label>
              <input v-model="text" placeholder="😀 或 LOGO 文本" maxlength="2" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">背景色</label>
              <input v-model="bg" placeholder="#ffffff00 透明也可" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">文字颜色</label>
              <input v-model="color" placeholder="#000000" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">字体大小</label>
              <input v-model.number="fontSize" type="number" min="8" max="256" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">尺寸（逗号分隔）</label>
              <input v-model="sizesInput" placeholder="16,32,48,64,180" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">生成</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>

          <p class="text-xs text-gray-500">提示：结果为多张 PNG，可单独下载；如需 .ico/zip，请在构建流程中合并。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div v-if="items.length" class="space-y-4">
          <div v-for="it in items" :key="it.size" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ it.size }}x{{ it.size }} PNG</h4>
              <div class="flex gap-2">
                <button @click="copyDataUrl(it.dataUrl)" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制 DataURL</button>
                <button @click="download(it)" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>
            <img :src="it.dataUrl" :alt="`favicon-${it.size}`" class="w-16 h-16 border rounded-md bg-white dark:bg-gray-700" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🧩</div>
          <div class="text-lg">输入文本与参数，生成多尺寸 PNG</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium">尺寸 {{ h.sizes.join(',') }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">文本: {{ h.text }} · 颜色: {{ h.color }} · 背景: {{ h.bg }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

type IconItem = { size: number; dataUrl: string };
type HistoryItem = { text: string; color: string; bg: string; sizes: number[]; timestamp: number; items: IconItem[] };

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
  navigator.clipboard.writeText(u).then(() => alert('已复制 DataURL'));
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
    if (!sizes.length) throw new Error('请提供有效尺寸，例如 16,32,48');
    items.value = sizes.map((sz) => ({ size: sz, dataUrl: drawIcon(sz) }));
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || '生成失败';
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
