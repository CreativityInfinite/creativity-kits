<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Excel 转 CSV</h1>
      <p class="text-gray-600 dark:text-gray-400">选择 Excel 文件（.xlsx/.xls），浏览器解析为 CSV（不上传）</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 选择 Excel 文件 </label>
          <input
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            @change="onFile"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <div class="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">分隔符</label>
              <input v-model="sep" maxlength="2" placeholder="," class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="bom" v-model="withBOM" type="checkbox" class="rounded mr-2" />
              <label for="bom" class="text-sm">含 UTF-8 BOM</label>
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
          <div v-if="csvFiles.length" class="space-y-2 mt-3">
            <div v-for="(it, i) in csvFiles" :key="i" class="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2">
              <div class="truncate">{{ it.name }}（{{ formatSize(it.size) }}）</div>
              <button @click="downloadCSV(i)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">下载</button>
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
const sep = ref(',');
const withBOM = ref(false);
const output = ref('');
const csvFiles = ref<{ name: string; blob: Blob; size: number }[]>([]);
const urls = new Set<string>();

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0] || null;
  file.value = f;
  clearOutputs();
  output.value = f ? `已选择：${f.name}` : '';
}
function clearOutputs() {
  csvFiles.value = [];
  for (const u of urls) URL.revokeObjectURL(u);
  urls.clear();
}
function formatSize(n: number) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}
function toCSV(rows: any[][], delimiter: string) {
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    if (/[",\n\r]/.test(s) || s.includes(delimiter)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  return rows.map((r) => r.map(escape).join(delimiter)).join('\r\n');
}

async function process() {
  clearOutputs();
  output.value = '';
  if (!file.value) {
    output.value = '请先选择 Excel 文件';
    return;
  }
  const t0 = performance.now();
  try {
    let XLSX: any;
    try {
      XLSX = (await import('https://esm.sh/xlsx@0.18.5?bundle')).default;
    } catch {
      XLSX = (await import('https://cdn.skypack.dev/xlsx@0.18.5')).default;
    }
    const buf = await file.value.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheets = wb.SheetNames;
    for (const name of sheets) {
      const ws = wb.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as any[][];
      const csvText = toCSV(rows, sep.value || ',');
      const bom = withBOM.value ? '\uFEFF' : '';
      const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8' });
      csvFiles.value.push({ name: `${name}.csv`, blob, size: blob.size });
    }
    const ms = Math.round(performance.now() - t0);
    output.value = `转换完成：工作表 ${sheets.length} 个，用时 ${ms}ms`;
  } catch (e: any) {
    console.error(e);
    output.value = '转换失败：' + (e?.message || String(e));
  }
}

function downloadCSV(i: number) {
  const it = csvFiles.value[i];
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
