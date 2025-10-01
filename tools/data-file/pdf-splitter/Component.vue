<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.pdf-splitter.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.pdf-splitter.page.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('tools.pdf-splitter.page.selectFile') }}</label>
          <input
            type="file"
            accept="application/pdf"
            @change="onFile"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div class="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.pdf-splitter.page.rangesLabel') }}</label>
              <input v-model="ranges" :placeholder="$t('tools.pdf-splitter.page.rangesPlaceholder')" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.pdf-splitter.page.prefixLabel') }}</label>
              <input v-model="prefix" :placeholder="$t('tools.pdf-splitter.page.prefixPlaceholder')" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.pdf-splitter.page.process') }}</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('tools.pdf-splitter.page.output') }}</label>
          <textarea
            :value="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            :placeholder="$t('tools.pdf-splitter.page.resultPlaceholder')"
          />
          <div v-if="filesOut.length" class="space-y-2 mt-3">
            <div v-for="(item, i) in filesOut" :key="i" class="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
              <div class="truncate">{{ item.name }}（{{ formatSize(item.size) }}）</div>
              <button @click="downloadPart(i)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.pdf-splitter.page.download') }}</button>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.pdf-splitter.page.copyResult') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const file = ref<File | null>(null);
const ranges = ref('');
const prefix = ref('split_');
const output = ref('');
const filesOut = ref<{ name: string; blob: Blob; size: number }[]>([]);
const downloadingUrls = new Set<string>();

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null;
  file.value = f;
  clearOutputs();
  output.value = f ? t('tools.pdf-splitter.page.selectedFile', { name: f.name }) : '';
}
function clearOutputs() {
  filesOut.value = [];
  for (const url of downloadingUrls) URL.revokeObjectURL(url);
  downloadingUrls.clear();
}
function formatSize(n: number) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}

function parseRanges(total: number): number[][] {
  const text = (ranges.value || '').trim();
  if (!text) return Array.from({ length: total }, (_, i) => [i, i]);
  const parts = text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const res: number[][] = [];
  for (const p of parts) {
    const m = p.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    let a = Math.max(1, parseInt(m[1], 10)),
      b = m[2] ? Math.max(1, parseInt(m[2], 10)) : a;
    if (a > b) [a, b] = [b, a];
    a = Math.min(a, total);
    b = Math.min(b, total);
    res.push([a - 1, b - 1]); // 转 0-based
  }
  return res;
}

async function process() {
  clearOutputs();
  output.value = '';
  if (!file.value) {
    output.value = t('tools.pdf-splitter.page.alertNoFile');
    return;
  }
  const t0 = performance.now();
  try {
    let PDFDocument: any;
    try {
      ({ PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1?bundle'));
    } catch {
      ({ PDFDocument } = await import('https://cdn.skypack.dev/pdf-lib@1.17.1'));
    }
    const buf = await file.value.arrayBuffer();
    const src = await PDFDocument.load(buf);
    const total = src.getPageCount();
    const groups = parseRanges(total);
    if (!groups.length) {
      for (let i = 0; i < total; i++) groups.push([i, i]);
    }
    let count = 0;
    for (const [start, end] of groups) {
      const out = await PDFDocument.create();
      const indices = Array.from({ length: end - start + 1 }, (_, k) => start + k);
      const copied = await out.copyPages(src, indices);
      for (const p of copied) out.addPage(p);
      const bytes = await out.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const name = `${prefix.value || 'split_'}${++count}_${start + 1}-${end + 1}.pdf`;
      filesOut.value.push({ name, blob, size: blob.size });
    }
    const ms = Math.round(performance.now() - t0);
    output.value = t('tools.pdf-splitter.page.splitDone', { name: file.value.name, total, count: filesOut.value.length, ms });
  } catch (e: any) {
    console.error(e);
    output.value = t('tools.pdf-splitter.page.splitFailedPrefix') + (e?.message || String(e));
  }
}

function downloadPart(i: number) {
  const it = filesOut.value[i];
  if (!it) return;
  const url = URL.createObjectURL(it.blob);
  downloadingUrls.add(url);
  const a = document.createElement('a');
  a.href = url;
  a.download = it.name;
  a.click();
}

async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.pdf-splitter.page.copied'));
  } catch (err) {
    console.error('复制失败:', err);
    alert(t('tools.pdf-splitter.page.copyFailed'));
  }
}

onUnmounted(() => {
  for (const url of downloadingUrls) URL.revokeObjectURL(url);
  downloadingUrls.clear();
});
</script>
