<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.contrast-checker.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.contrast-checker.page.foreground') }}</label>
              <input v-model="fg" placeholder="#222222" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.contrast-checker.page.background') }}</label>
              <input v-model="bg" placeholder="#ffffff" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="largeText" v-model="largeText" type="checkbox" class="rounded mr-2" />
              <label for="largeText" class="text-sm">{{ $t('tools.contrast-checker.page.largeText') }}</label>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.contrast-checker.page.sampleText') }}</label>
              <input
                v-model="sampleText"
                :placeholder="$t('tools.contrast-checker.page.samplePlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.contrast-checker.page.check') }}
            </button>
            <button @click="swapColors" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.contrast-checker.page.swap') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.contrast-checker.page.clear') }}</button>
          </div>

          <div class="rounded-md overflow-hidden border dark:border-gray-700">
            <div class="p-4" :style="{ color: fg, background: bg }">
              <div :class="['font-medium', largeText ? 'text-2xl' : 'text-base']">{{ sampleText || $t('tools.contrast-checker.page.samplePlaceholder') }}</div>
              <div class="text-xs opacity-70 mt-2">{{ $t('tools.contrast-checker.page.fgShort') }} {{ fg }} · {{ $t('tools.contrast-checker.page.bgShort') }} {{ bg }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.contrast-checker.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">{{ $t('tools.contrast-checker.page.contrastAndCompliance') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.contrast-checker.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.contrast-checker.page.download') }}</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="text-xs text-gray-500 mt-2">{{ $t('tools.contrast-checker.page.processingTime') }}: {{ processingTime }}ms</div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.contrast-checker.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🎨</div>
          <div class="text-lg">{{ $t('tools.contrast-checker.page.emptyTip') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.contrast-checker.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium">{{ $t('tools.contrast-checker.page.ratio') }} {{ h.ratio }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs">{{ $t('tools.contrast-checker.page.fgShort') }} {{ h.fg }} / {{ $t('tools.contrast-checker.page.bgShort') }} {{ h.bg }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.contrast-checker.page.load') }}</button>
            <button @click="copyText(h.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.contrast-checker.page.copy') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.contrast-checker.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.contrast-checker.page.standardTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>{{ $t('tools.contrast-checker.page.standardLine1') }}</div>
        <div>{{ $t('tools.contrast-checker.page.standardLine2') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type HistoryItem = { fg: string; bg: string; ratio: string; result: string; timestamp: number };

const fg = ref('#222222');
const bg = ref('#ffffff');
const largeText = ref(false);
const { t } = useI18n();
const sampleText = ref(t('tools.contrast-checker.page.samplePlaceholder'));

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => !!parseColor(fg.value) && !!parseColor(bg.value));

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function swapColors() {
  const tmp = fg.value;
  fg.value = bg.value;
  bg.value = tmp;
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.contrast-checker.page.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `contrast_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const parsed = JSON.parse(result.value);
  const item: HistoryItem = { fg: parsed.input.fg, bg: parsed.input.bg, ratio: parsed.ratio, result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('contrast-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result;
  fg.value = h.fg;
  bg.value = h.bg;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('contrast-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, { hour12: false });
}

function parseColor(hex: string) {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const srgb = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function contrastRatio(fgRgb: any, bgRgb: any) {
  const L1 = luminance(fgRgb);
  const L2 = luminance(bgRgb);
  const lighter = Math.max(L1, L2),
    darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const f = parseColor(fg.value);
    const b = parseColor(bg.value);
    if (!f || !b) throw new Error(t('tools.contrast-checker.page.invalidColorFormat'));
    const ratioNum = contrastRatio(f, b);
    const ratio = ratioNum.toFixed(2);
    const isLarge = !!largeText.value;
    const passAA = isLarge ? ratioNum >= 3 : ratioNum >= 4.5;
    const passAAA = isLarge ? ratioNum >= 4.5 : ratioNum >= 7;
    result.value = JSON.stringify({ input: { fg: fg.value, bg: bg.value, largeText: isLarge }, ratio, wcag: { AA: passAA, AAA: passAAA } }, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.contrast-checker.page.calcFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('contrast-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
