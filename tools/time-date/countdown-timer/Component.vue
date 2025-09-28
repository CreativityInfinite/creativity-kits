<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">倒计时</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">目标时间（本地时区）</label>
            <input v-model="target" type="datetime-local" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="beep" v-model="beep" type="checkbox" class="rounded mr-2" />
              <label for="beep" class="text-sm">结束提示音</label>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">保存标签（可选）</label>
              <input v-model="label" placeholder="如 会议开始" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="start" :disabled="!canStart" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">开始</button>
            <button @click="stop" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">停止</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>

        <div class="rounded-md overflow-hidden border dark:border-gray-700">
          <div class="p-6 bg-gray-50 dark:bg-gray-800 text-center">
            <div class="text-4xl font-mono">{{ display }}</div>
            <div class="text-xs text-gray-500 mt-2" v-if="endAt">目标: {{ new Date(endAt).toLocaleString('zh-CN', { hour12: false }) }}</div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">状态</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <textarea :value="result" readonly rows="8" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          <div class="text-xs text-gray-500 mt-2" v-if="processingTime">运行时长: {{ processingTime }}ms</div>
        </div>

        <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-2">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.label || '(无标签)' }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs">目标: {{ new Date(h.endAt).toLocaleString('zh-CN', { hour12: false }) }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <audio ref="audioRef">
      <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABYAAAABAACAgICAgP8=" type="audio/wav" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
type HistoryItem = { endAt: number; label: string; result: string; timestamp: number };

const target = ref('');
const beep = ref(true);
const label = ref('');

const endAt = ref<number | null>(null);
const display = ref('00:00:00');
const timer = ref<number | null>(null);

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);
const audioRef = ref<HTMLAudioElement | null>(null);

const canStart = computed(() => !!target.value);

function clearAll() {
  stop();
  result.value = '';
  error.value = '';
  processingTime.value = null;
  display.value = '00:00:00';
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert('已复制到剪贴板'));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const filename = `countdown_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!endAt.value) return;
  const item: HistoryItem = { endAt: endAt.value, label: label.value.trim(), result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('countdown-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  target.value = new Date(h.endAt).toISOString().slice(0, 16);
  result.value = h.result;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('countdown-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function tick() {
  if (endAt.value == null) return;
  const now = Date.now();
  const remainMs = Math.max(0, endAt.value - now);
  const sec = Math.floor(remainMs / 1000);
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60),
    s = sec % 60;
  display.value = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  result.value = JSON.stringify({ endAt: endAt.value, now, remainMs, remainSec: sec, display: display.value }, null, 2);
  if (remainMs <= 0) {
    stop();
    if (beep.value) audioRef.value?.play().catch(() => {});
  }
}
function start() {
  try {
    const d = new Date(target.value);
    const t = d.getTime();
    if (Number.isNaN(t)) throw new Error('无效的目标时间');
    endAt.value = t;
    processingTime.value = 0;
    stop();
    tick();
    timer.value = window.setInterval(tick, 500);
  } catch (e: any) {
    error.value = e?.message || '启动失败';
  }
}
function stop() {
  if (timer.value != null) {
    window.clearInterval(timer.value);
    timer.value = null;
  }
}

onMounted(() => {
  const saved = localStorage.getItem('countdown-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
onUnmounted(() => stop());
</script>
