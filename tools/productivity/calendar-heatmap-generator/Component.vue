<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">日历热力图生成器</h1>
      <p class="text-gray-600 dark:text-gray-400">根据日期-数值数据生成年度热力图 SVG，可下载。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">年份</label>
        <input v-model.number="year" type="number" min="1970" max="2100" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">最大值（映射强度）</label>
        <input v-model.number="maxValue" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div class="flex items-end">
        <button @click="fillRandom" class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">填充随机数据</button>
      </div>

      <div class="md:col-span-3">
        <label class="block text-sm font-medium mb-2">日期-数值（每行：YYYY-MM-DD, value）</label>
        <textarea v-model="raw" rows="8" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="2025-01-01, 3"></textarea>
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="generate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">生成</button>
      <button v-if="svg" @click="downloadSvg" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">下载 SVG</button>
    </div>

    <div v-if="svg" class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">预览</div>
      <div v-html="svg"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const year = ref(new Date().getFullYear());
const maxValue = ref(5);
const raw = ref('');
const svg = ref('');

function dateToWeekIndex(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = Math.floor((+d - +start) / 86400000);
  return Math.floor((diff + start.getDay()) / 7);
}

function colorFor(v: number) {
  const a = Math.max(0, Math.min(1, v / Math.max(1, maxValue.value)));
  const g = Math.round(255 * (1 - a));
  const b = Math.round(255 * (1 - a * 0.3));
  return `rgb(34, ${g}, ${b})`;
}

function generate() {
  const data = new Map<string, number>();
  for (const line of (raw.value || '').split(/\r?\n/)) {
    const m = line.trim().match(/^(\d{4})-(\d{2})-(\d{2})\s*,\s*(-?\d+(\.\d+)?)$/);
    if (m) data.set(m[1] + '-' + m[2] + '-' + m[3], Number(m[4]));
  }

  const start = new Date(year.value, 0, 1);
  const end = new Date(year.value, 11, 31);
  const dayRects: string[] = [];
  let maxWeek = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    const v = data.get(key) || 0;
    const week = dateToWeekIndex(d);
    maxWeek = Math.max(maxWeek, week);
    const day = d.getDay();
    const x = week * 14;
    const y = day * 14;
    const fill = v === 0 ? '#ebedf0' : colorFor(v);
    dayRects.push(`<rect x="${x}" y="${y}" width="12" height="12" rx="2" ry="2" fill="${fill}" data-date="${key}" />`);
  }

  const width = (maxWeek + 1) * 14 + 2;
  const height = 7 * 14 + 2;
  svg.value = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${dayRects.join('')}</svg>`;
}

function fillRandom() {
  const start = new Date(year.value, 0, 1);
  const end = new Date(year.value, 11, 31);
  const lines: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (Math.random() < 0.4) {
      const key = d.toISOString().split('T')[0];
      lines.push(`${key}, ${Math.floor(Math.random() * (maxValue.value + 1))}`);
    }
  }
  raw.value = lines.join('\n');
}

function downloadSvg() {
  if (!svg.value) return;
  const blob = new Blob([svg.value], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `heatmap-${year.value}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
