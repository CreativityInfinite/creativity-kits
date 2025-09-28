<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">ZIP 压缩解压</h1>
      <p class="text-gray-600 dark:text-gray-400">在浏览器本地进行 ZIP 压缩/解压（不上传）</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 模式与文件 </label>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="modeZip" type="radio" value="zip" v-model="mode" class="mr-2" />
              <label for="modeZip" class="text-sm">压缩</label>
              <input id="modeUnzip" type="radio" value="unzip" v-model="mode" class="ml-4 mr-2" />
              <label for="modeUnzip" class="text-sm">解压</label>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">ZIP 名称（压缩时）</label>
              <input v-model="zipName" placeholder="archive.zip" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div class="mt-3">
            <input
              v-if="mode === 'zip'"
              type="file"
              multiple
              @change="onFiles"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <input
              v-else
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              @change="onZip"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div v-if="files.length && mode === 'zip'" class="space-y-2 mt-3">
            <div v-for="(f, i) in files" :key="i" class="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
              <div class="truncate">{{ f.name }}（{{ formatSize(f.size) }}）</div>
              <button @click="removeAt(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">移除</button>
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
          <div v-if="outFiles.length" class="space-y-2 mt-3">
            <div v-for="(it, i) in outFiles" :key="i" class="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
              <div class="truncate">{{ it.name }}（{{ formatSize(it.size) }}）</div>
              <button @click="downloadOut(i)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">下载</button>
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

const mode = ref<'zip' | 'unzip'>('zip');
const files = ref<File[]>([]);
const zipFile = ref<File | null>(null);
const zipName = ref('archive.zip');

const output = ref('');
const outFiles = ref<{ name: string; blob: Blob; size: number }[]>([]);
const urls = new Set<string>();

function formatSize(n: number) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}
function clearOutputs() {
  outFiles.value = [];
  for (const u of urls) URL.revokeObjectURL(u);
  urls.clear();
}
function onFiles(e: Event) {
  files.value = Array.from((e.target as HTMLInputElement).files || []);
  clearOutputs();
  output.value = files.value.length ? `已选择 ${files.value.length} 个文件` : '';
}
function onZip(e: Event) {
  zipFile.value = (e.target as HTMLInputElement).files?.[0] || null;
  clearOutputs();
  output.value = zipFile.value ? `已选择：${zipFile.value.name}` : '';
}
function removeAt(i: number) {
  const arr = files.value.slice();
  arr.splice(i, 1);
  files.value = arr;
  if (!files.value.length) clearOutputs();
}

async function process() {
  clearOutputs();
  output.value = '';
  const t0 = performance.now();
  try {
    let JSZip: any;
    try {
      JSZip = (await import('https://esm.sh/jszip@3.10.1?bundle')).default;
    } catch {
      JSZip = (await import('https://cdn.skypack.dev/jszip@3.10.1')).default;
    }

    if (mode.value === 'zip') {
      if (!files.value.length) {
        output.value = '请先选择需要压缩的文件';
        return;
      }
      const zip = new JSZip();
      for (const f of files.value) zip.file(f.name, await f.arrayBuffer());
      const blob = await zip.generateAsync({ type: 'blob' });
      outFiles.value.push({ name: zipName.value || 'archive.zip', blob, size: blob.size });
      const ms = Math.round(performance.now() - t0);
      output.value = `压缩完成：${files.value.length} 个文件 → ${formatSize(blob.size)}，用时 ${ms}ms`;
    } else {
      if (!zipFile.value) {
        output.value = '请先选择 ZIP 文件';
        return;
      }
      const zip = await JSZip.loadAsync(await zipFile.value.arrayBuffer());
      const entries = Object.keys(zip.files);
      for (const name of entries) {
        const entry = zip.files[name];
        if (entry.dir) continue;
        const blob = await entry.async('blob');
        outFiles.value.push({ name, blob, size: blob.size });
      }
      const ms = Math.round(performance.now() - t0);
      output.value = `解压完成：${entries.length} 个条目，导出文件 ${outFiles.value.length} 个，用时 ${ms}ms`;
    }
  } catch (e: any) {
    console.error(e);
    output.value = (mode.value === 'zip' ? '压缩失败：' : '解压失败：') + (e?.message || String(e));
  }
}

function downloadOut(i: number) {
  const it = outFiles.value[i];
  if (!it) return;
  const url = URL.createObjectURL(it.blob);
  urls.add(url);
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
  for (const u of urls) URL.revokeObjectURL(u);
  urls.clear();
});
</script>
