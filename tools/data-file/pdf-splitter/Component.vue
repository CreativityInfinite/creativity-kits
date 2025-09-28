<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">PDF 分割器</h1>
      <p class="text-gray-600 dark:text-gray-400">选择一个 PDF 并按页范围拆分为多个文件（在浏览器本地处理，不上传）</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 选择 PDF 文件 </label>
          <input
            type="file"
            accept="application/pdf"
            @change="onFile"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div class="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">页范围（如 1-3,5,7-9）</label>
              <input v-model="ranges" placeholder="1-3,5,7-9 或留空表示逐页拆分" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">文件名前缀</label>
              <input v-model="prefix" placeholder="split_" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">处理</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输出 </label>
          <textarea
            :value="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            placeholder="处理结果将显示在这里..."
          />
          <div v-if="filesOut.length" class="space-y-2 mt-3">
            <div v-for="(item, i) in filesOut" :key="i" class="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
              <div class="truncate">{{ item.name }}（{{ formatSize(item.size) }}）</div>
              <button @click="downloadPart(i)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">下载</button>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">复制结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue';

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
  output.value = f ? `已选择：${f.name}` : '';
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
    output.value = '请先选择 PDF 文件';
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
    output.value = `拆分完成：${file.value.name} 共 ${total} 页，输出 ${filesOut.value.length} 个文件，用时 ${ms}ms`;
  } catch (e: any) {
    console.error(e);
    output.value = '拆分失败：' + (e?.message || String(e));
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
    alert('已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
    alert('复制失败，请手动复制');
  }
}

onUnmounted(() => {
  for (const url of downloadingUrls) URL.revokeObjectURL(url);
  downloadingUrls.clear();
});
</script>
