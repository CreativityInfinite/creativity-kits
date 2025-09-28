<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">ICS 日历生成器</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">事件列表（每行一个，制表符分隔：标题 开始 结束 位置 可选描述）</label>
            <textarea
              v-model="eventsText"
              rows="10"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="会议\t2025-01-01T09:00:00\t2025-01-01T10:00:00\t会议室A\t讨论研发路线"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="utc" v-model="asUTC" type="checkbox" class="rounded mr-2" />
              <label for="utc" class="text-sm">使用 UTC（否则使用本地时区）</label>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">日历名称</label>
              <input v-model="calName" placeholder="MyCalendar" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">生成</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>

          <p class="text-xs text-gray-500">提示：导出的 .ics 可导入各类日历应用（Google/Apple/Outlook）。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">日历文件</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载 .ics</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">📅</div>
          <div class="text-lg">提供事件列表，生成 iCalendar (.ics)</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.calName || 'Calendar' }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs">事件数: {{ h.count }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
type HistoryItem = { calName: string; count: number; result: string; timestamp: number };

const eventsText = ref('');
const asUTC = ref(false);
const calName = ref('MyCalendar');

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => eventsText.value.trim().length > 0);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert('已复制到剪贴板'));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (calName.value || 'calendar') + '.ics';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const lines = result.value.split('\n').filter((l) => l.startsWith('BEGIN:VEVENT')).length;
  const item: HistoryItem = { calName: calName.value, count: lines, result: result.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('ics-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('ics-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function fmt(dt: string) {
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) throw new Error('无效时间: ' + dt);
  if (asUTC.value) {
    const yyyy = d.getUTCFullYear().toString().padStart(4, '0');
    const MM = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const DD = d.getUTCDate().toString().padStart(2, '0');
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    const ss = d.getUTCSeconds().toString().padStart(2, '0');
    return `${yyyy}${MM}${DD}T${hh}${mm}${ss}Z`;
  } else {
    const yyyy = d.getFullYear().toString().padStart(4, '0');
    const MM = (d.getMonth() + 1).toString().padStart(2, '0');
    const DD = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    const ss = d.getSeconds().toString().padStart(2, '0');
    return `${yyyy}${MM}${DD}T${hh}${mm}${ss}`;
  }
}
function uid() {
  return Math.random().toString(36).slice(2);
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const lines = eventsText.value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) throw new Error('无事件');
    const blocks: string[] = [];
    for (const line of lines) {
      const [summary, dtStart, dtEnd, location = '', desc = ''] = line.split('\t');
      if (!summary || !dtStart || !dtEnd) throw new Error('每行至少包含：标题 开始 结束');
      const uid = uid();
      blocks.push(
        `BEGIN:VEVENT
UID:${uid}@fancytools
SUMMARY:${summary}
DTSTART:${fmt(dtStart)}
DTEND:${fmt(dtEnd)}
LOCATION:${location || ''}
DESCRIPTION:${desc || ''}
END:VEVENT`
      );
    }
    const now = new Date();
    const cal = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FancyTools//ICS Generator//CN',
      `X-WR-CALNAME:${calName.value || 'Calendar'}`,
      `DTSTAMP:${fmt(now.toISOString())}`,
      ...blocks,
      'END:VCALENDAR'
    ].join('\n');
    result.value = cal;
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || '生成失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('ics-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
