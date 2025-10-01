<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.elevation-profiler.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.elevation-profiler.page.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.elevation-profiler.page.inputLabel') }} </label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('tools.elevation-profiler.page.inputPlaceholder')"
          />
        </div>

        <div class="flex justify-center gap-2">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.elevation-profiler.page.process') }}</button>
          <button @click="downloadCSV" :disabled="!csv" class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.elevation-profiler.page.downloadCsv') }}
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.elevation-profiler.page.outputLabel') }} </label>
          <textarea
            :value="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white font-mono text-sm"
            :placeholder="$t('tools.elevation-profiler.page.outputPlaceholder')"
          />
          <div class="mt-3">
            <canvas ref="canvasRef" class="w-full bg-white dark:bg-gray-800 rounded border dark:border-gray-700" height="160"></canvas>
          </div>
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.elevation-profiler.page.copyResult') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const input = ref('');
const output = ref('');
const csv = ref('');
const canvasRef = ref<HTMLCanvasElement | null>(null);

async function process() {
  // 输入：多行 "lon,lat"
  const raw = (input.value || '').trim();
  if (!raw) {
    output.value = '';
    csv.value = '';
    draw([]);
    return;
  }
  const pts = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
      if (!m) return null;
      return { lon: parseFloat(m[1]), lat: parseFloat(m[2]) };
    })
    .filter(Boolean) as { lon: number; lat: number }[];
  if (pts.length < 2) {
    output.value = t('tools.elevation-profiler.page.needAtLeastTwoPoints');
    csv.value = '';
    draw([]);
    return;
  }

  // 计算累计距离（m）
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const haversine = (a: { lon: number; lat: number }, b: { lon: number; lat: number }) => {
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };
  const xs: number[] = [0];
  for (let i = 1; i < pts.length; i++) xs[i] = xs[i - 1] + haversine(pts[i - 1], pts[i]);

  // 本地模拟高程：使用多个正弦叠加制造起伏（非真实海拔，仅用于演示）
  const maxX = xs[xs.length - 1];
  const es: number[] = xs.map((d, i) => {
    const base = 200 + 100 * Math.sin((2 * Math.PI * d) / (maxX || 1));
    const wobble = 30 * Math.sin(i * 0.7) + 20 * Math.sin(i * 1.3);
    return Math.max(0, Math.round(base + wobble));
  });

  // 输出 JSON 与 CSV
  const arr = xs.map((d, i) => ({ distance_m: Math.round(d), elevation_m: es[i] }));
  output.value = JSON.stringify({ total_distance_m: Math.round(maxX), profile: arr, note: t('tools.elevation-profiler.page.jsonNoteDemo') }, null, 2);
  csv.value = 'distance_m,elevation_m\n' + arr.map((r) => `${r.distance_m},${r.elevation_m}`).join('\n');

  draw(arr);
}

function draw(profile: { distance_m: number; elevation_m: number }[]) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!profile.length) return;
  const maxX = profile[profile.length - 1].distance_m || 1;
  const maxY = Math.max(...profile.map((p) => p.elevation_m)) || 1;
  // 背景网格
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    const y = (i * h) / 5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // 曲线
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < profile.length; i++) {
    const x = (profile[i].distance_m / maxX) * (w - 10) + 5;
    const y = h - (profile[i].elevation_m / maxY) * (h - 10) - 5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // 填充
  ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
  ctx.lineTo(w - 5, h - 5);
  ctx.lineTo(5, h - 5);
  ctx.closePath();
  ctx.fill();
}

function downloadCSV() {
  if (!csv.value) return;
  const blob = new Blob([csv.value], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'elevation_profile.csv';
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  const c = canvasRef.value;
  if (c) {
    // 将 CSS 宽度自适应映射到实际像素宽度（可选）
    c.width = c.clientWidth || 640;
  }
});
async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.elevation-profiler.page.copied'));
  } catch (err) {
    console.error('复制失败:', err);
    alert(t('tools.elevation-profiler.page.copyFailed'));
  }
}
</script>
