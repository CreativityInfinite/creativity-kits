<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.gradient-generator.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.gradient-generator.page.params') }}</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.gradient-generator.page.angle') }}</label>
                <input v-model.number="angle" type="number" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.gradient-generator.page.steps') }}</label>
                <input v-model.number="steps" type="number" min="2" max="64" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="8" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.gradient-generator.page.colorsLabel') }}</label>
            <input
              v-model="colorsText"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.gradient-generator.page.colorsPlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.gradient-generator.page.sampleTip') }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.gradient-generator.page.outputFormat') }}</label>
            <div class="flex gap-2">
              <button
                @click="outputFormat = 'css'"
                :class="['flex-1 px-3 py-2 rounded-md text-sm', outputFormat === 'css' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
              >
                {{ $t('tools.gradient-generator.page.fmtCss') }}
              </button>
              <button
                @click="outputFormat = 'json'"
                :class="['flex-1 px-3 py-2 rounded-md text-sm', outputFormat === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
              >
                {{ $t('tools.gradient-generator.page.fmtJson') }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.gradient-generator.page.inputLabel') }}</label>
            <textarea
              v-model="inputText"
              rows="6"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.gradient-generator.page.inputPlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.gradient-generator.page.inputExplain') }}</p>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.gradient-generator.page.generate') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.gradient-generator.page.clear') }}</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.gradient-generator.page.swapView') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.gradient-generator.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ outputFormat === 'css' ? $t('tools.gradient-generator.page.codeTitleCss') : $t('tools.gradient-generator.page.codeTitleJson') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.gradient-generator.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.gradient-generator.page.download') }}</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="8" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>{{ $t('tools.gradient-generator.page.outputLength') }}: {{ result.length }} {{ $t('tools.gradient-generator.page.codeTitleJson').includes('JSON') ? '' : $t('tools.gradient-generator.page.chars') }}</div>
              <div v-if="processingTime">{{ $t('tools.gradient-generator.page.processingTime') }}: {{ processingTime }}ms</div>
              <div>{{ $t('tools.gradient-generator.page.angleShort') }}: {{ lastInfo.angle }}° | {{ $t('tools.gradient-generator.page.stepsShort') }}: {{ lastInfo.steps }}</div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.gradient-generator.page.previewTitle') }}</h4>
            <div class="h-32 w-full rounded-md border dark:border-gray-700" :style="{ background: previewCss }"></div>
            <div class="mt-3 grid grid-cols-8 gap-1">
              <div v-for="(c, i) in palette" :key="i" class="h-6 rounded border dark:border-gray-700" :title="c" :style="{ background: c }"></div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.gradient-generator.page.saveToHistory') }}</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🎨</div>
          <div class="text-lg mb-2">{{ $t('tools.gradient-generator.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.gradient-generator.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.gradient-generator.page.errorPanelTitle') }}</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.gradient-generator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">{{ $t('tools.gradient-generator.page.historyAngleSteps', { angle: item.angle, steps: item.steps }) }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">
                {{ item.outputFormat.toUpperCase() }} · {{ item.outputLength }} {{ $t('tools.gradient-generator.page.codeTitleJson').includes('JSON') ? '' : $t('tools.gradient-generator.page.chars') }}
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.gradient-generator.page.load') }}</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.gradient-generator.page.copyResult') }}</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.gradient-generator.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.gradient-generator.page.tipsTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>{{ $t('tools.gradient-generator.page.tip1') }}</div>
        <div>{{ $t('tools.gradient-generator.page.tip2') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type HistoryItem = {
  angle: number;
  steps: number;
  colors: string[];
  outputFormat: 'css' | 'json';
  result: string;
  outputLength: number;
  timestamp: number;
};

const angle = ref(0);
const steps = ref(8);
const colorsText = ref('#ff7e5f, #feb47b');
const inputText = ref('');
const outputFormat = ref<'css' | 'json'>('css');

const { t } = useI18n();
const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

// 解析输入与上方参数得到规范颜色数组
const colors = computed(() => {
  const list: string[] = [];
  const add = (c: string) => {
    const t = c.trim();
    if (!t) return;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) list.push(t.toLowerCase());
  };

  // 先用上方 colorsText
  colorsText.value.split(',').forEach(add);

  // 若输入提供颜色行也合并
  if (inputText.value.trim()) {
    const lines = inputText.value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const line of lines) {
      const kv = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (kv) continue;
      add(line);
    }
  }
  // 去重
  return Array.from(new Set(list));
});

const canProcess = computed(() => colors.value.length >= 2 && steps.value >= 2);

const lastInfo = ref({ angle: 0, steps: 0 });
const palette = ref<string[]>([]);
const previewCss = computed(() => {
  const css = `linear-gradient(${angle.value}deg, ${colors.value.join(', ')})`;
  return css;
});

function hexToRgb(hex: string) {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map((x) =>
      Math.max(0, Math.min(255, Math.round(x)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('');

function interpolatePalette(cols: string[], n: number): string[] {
  const rgb = cols.map((c) => hexToRgb(c)).filter(Boolean) as { r: number; g: number; b: number }[];
  if (rgb.length < 2) return [];
  const res: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const seg = (rgb.length - 1) * t;
    const i0 = Math.floor(seg);
    const i1 = Math.min(rgb.length - 1, i0 + 1);
    const local = seg - i0;
    const r = rgb[i0].r + (rgb[i1].r - rgb[i0].r) * local;
    const g = rgb[i0].g + (rgb[i1].g - rgb[i0].g) * local;
    const b = rgb[i0].b + (rgb[i1].b - rgb[i0].b) * local;
    res.push(rgbToHex(r, g, b));
  }
  return res;
}

function parseKvFromInput() {
  if (!inputText.value.trim()) return;
  const lines = inputText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const line of lines) {
    const m = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (!m) continue;
    const k = m[1].toLowerCase();
    const v = m[2];
    if (k === 'angle') {
      const a = parseFloat(v);
      if (!Number.isNaN(a)) angle.value = a;
    } else if (k === 'steps') {
      const s = parseInt(v, 10);
      if (!Number.isNaN(s)) steps.value = Math.max(2, Math.min(64, s));
    }
  }
}

function buildCssGradient(cols: string[]) {
  return `background: linear-gradient(${angle.value}deg, ${cols.join(', ')});`;
}

function buildJsonPalette(cols: string[], pal: string[]) {
  return JSON.stringify(
    {
      angle: angle.value,
      steps: steps.value,
      colors: cols,
      palette: pal
    },
    null,
    2
  );
}

function swapView() {
  if (!result.value) return;
  outputFormat.value = outputFormat.value === 'css' ? 'json' : 'css';
}

function clearAll() {
  inputText.value = '';
  result.value = '';
  error.value = '';
  processingTime.value = null;
  palette.value = [];
  lastInfo.value = { angle: 0, steps: 0 };
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.gradient-generator.page.copied')));
}

function copyResult() {
  if (result.value) copyText(result.value);
}

function downloadResult() {
  if (!result.value) return;
  const ext = outputFormat.value === 'css' ? 'css' : 'json';
  const filename = `gradient_${new Date().toISOString().slice(0, 10)}.${ext}`;
  const blob = new Blob([result.value], { type: ext === 'css' ? 'text/css' : 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveToHistory() {
  if (!result.value) return;
  const item: HistoryItem = {
    angle: angle.value,
    steps: steps.value,
    colors: colors.value.slice(),
    outputFormat: outputFormat.value,
    result: result.value,
    outputLength: result.value.length,
    timestamp: Date.now()
  };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('gradient-history', JSON.stringify(history.value));
}

function loadFromHistory(item: HistoryItem) {
  angle.value = item.angle;
  steps.value = item.steps;
  colorsText.value = item.colors.join(', ');
  outputFormat.value = item.outputFormat;
  result.value = item.result;
  processingTime.value = null;
  error.value = '';
  // 重新计算预览与 palette
  palette.value = interpolatePalette(item.colors, item.steps);
  lastInfo.value = { angle: item.angle, steps: item.steps };
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  localStorage.setItem('gradient-history', JSON.stringify(history.value));
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;

  const start = performance.now();
  try {
    parseKvFromInput();

    if (!canProcess.value) {
      throw new Error(t('tools.gradient-generator.page.needAtLeastTwoColors'));
    }
    const cols = colors.value;
    const pal = interpolatePalette(cols, Math.max(2, Math.min(64, steps.value)));
    palette.value = pal;
    lastInfo.value = { angle: angle.value, steps: steps.value };

    if (outputFormat.value === 'css') {
      result.value = buildCssGradient(cols);
    } else {
      result.value = buildJsonPalette(cols, pal);
    }
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.gradient-generator.page.processFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('gradient-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
