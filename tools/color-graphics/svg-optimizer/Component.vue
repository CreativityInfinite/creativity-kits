<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.svg-optimizer.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.svg-optimizer.page.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.svg-optimizer.page.inputLabel') }} </label>
          <textarea
            v-model="input"
            rows="10"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
            :placeholder="$t('tools.svg-optimizer.page.inputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.svg-optimizer.page.process') }}</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.svg-optimizer.page.outputLabel') }} </label>
          <textarea
            :value="output"
            readonly
            rows="10"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white font-mono text-sm"
            :placeholder="$t('tools.svg-optimizer.page.resultPlaceholder')"
          />
          <div v-if="stats" class="text-xs text-gray-500 mt-2">{{ $t('tools.svg-optimizer.page.stats', { orig: stats.orig, min: stats.min, ratio: stats.ratio }) }}</div>
          <div class="flex justify-center mt-3">
            <button @click="downloadSVG" :disabled="!output" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
              {{ $t('tools.svg-optimizer.page.download') }}
            </button>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.svg-optimizer.page.copyResult') }}
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
const input = ref('');
const output = ref('');
const stats = ref<{ orig: number; min: number; ratio: number } | null>(null);

function minifySvg(svg: string) {
  let s = svg;
  // 去掉 XML 声明、注释
  s = s.replace(/<!--[\s\S]*?-->|<!--[\s\S]*?-->/g, '');
  s = s.replace(/<\?xml[\s\S]*?\?>/gi, '');
  // 移除常见的编辑器元数据标签
  s = s.replace(/<\/?(?:metadata|defs)\b[^>]*>/gi, '');
  // 合并多余空白
  s = s.replace(/\s{2,}/g, ' ');
  s = s.replace(/>\s+</g, '><');
  // 去掉不必要的空属性和空 style
  s = s.replace(/\s(?:id|class|style|data-[\w:-]+)=(["'])\s*\1/g, '');
  // 去掉行首尾空白
  s = s.trim();
  return s;
}

function process() {
  const raw = (input.value || '').trim();
  if (!raw) {
    output.value = '';
    stats.value = null;
    return;
  }
  const origLen = new Blob([raw]).size;
  const min = minifySvg(raw);
  const minLen = new Blob([min]).size;
  output.value = min;
  const ratio = origLen ? Math.round((100 * (origLen - minLen)) / origLen) : 0;
  stats.value = { orig: origLen, min: minLen, ratio };
}

async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.svg-optimizer.page.copied'));
  } catch (err) {
    console.error(t('tools.svg-optimizer.page.copyFailedLog'), err);
    alert(t('tools.svg-optimizer.page.copyFailed'));
  }
}

function downloadSVG() {
  if (!output.value) return;
  const blob = new Blob([output.value], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'optimized.svg';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
