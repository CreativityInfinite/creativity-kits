<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">自然日期解析</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">文本</label>
            <textarea
              v-model="text"
              rows="6"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="示例：明天 9:00；下周一 14:30；in 3 days; next friday 6pm; 2025-01-01 10:00"
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">基准时间</label>
              <input v-model="base" type="datetime-local" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="assumeTime" v-model="assumeNoTimeTo" type="checkbox" class="rounded mr-2" />
              <label for="assumeTime" class="text-sm">无时间默认 09:00</label>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">解析</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
          <p class="text-xs text-gray-500">支持简单中文/英文规则：今天/明天/昨天、下周一/二/…、in N days/hours/minutes、next monday、HH:mm/6pm 等。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">解析输出</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          <div class="text-xs text-gray-500 mt-2" v-if="processingTime">处理时间: {{ processingTime }}ms</div>
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
            <div class="font-medium truncate">{{ h.text }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">解析: {{ h.summary }}</div>
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
import { computed, onMounted, ref } from 'vue';
type HistoryItem = { text: string; base: string; result: string; summary: string; timestamp: number };

const text = ref('');
const base = ref('');
const assumeNoTimeTo = ref(true);

const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => text.value.trim().length > 0);

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
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'natural-date.json';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const parsed = JSON.parse(result.value);
  history.value.unshift({ text: text.value, base: base.value, result: result.value, summary: parsed.output?.local || '', timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('natural-date-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  text.value = h.text;
  base.value = h.base;
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('natural-date-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function setTime(d: Date, h: number, m: number) {
  const c = new Date(d);
  c.setHours(h, m, 0, 0);
  return c;
}
function parseHhmm(s: string) {
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return { hh, mm };
}
function parseAmPm(s: string) {
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2] || '0', 10);
  const ampm = m[3].toLowerCase();
  if (ampm === 'pm' && hh < 12) hh += 12;
  if (ampm === 'am' && hh === 12) hh = 0;
  return { hh: Math.min(23, hh), mm: Math.min(59, mm) };
}
const zhWeekMap: Record<string, number> = { 周日: 0, 星期日: 0, 周天: 0, 周一: 1, 星期一: 1, 周二: 2, 星期二: 2, 周三: 3, 星期三: 3, 周四: 4, 星期四: 4, 周五: 5, 星期五: 5, 周六: 6, 星期六: 6 };
const enWeekMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

function nextDow(from: Date, dow: number) {
  const d = new Date(from);
  const cur = d.getDay();
  const add = (dow - cur + 7) % 7 || 7;
  return addDays(d, add);
}

function parseRelative(t: string, baseDate: Date): Date | null {
  const s = t.trim().toLowerCase();
  if (s === 'today' || s === '现在' || s === '今日' || s === '今天') return new Date(baseDate);
  if (s === 'yesterday' || s === '昨日' || s === '昨天') return addDays(baseDate, -1);
  if (s === 'tomorrow' || s === '明天' || s === '翌日') return addDays(baseDate, 1);

  let m = s.match(/^in\s+(\d+)\s+(seconds|second|secs|sec|minutes|minute|mins|min|hours|hour|days|day|weeks|week)$/);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2];
    const d = new Date(baseDate);
    if (/second/.test(unit)) d.setSeconds(d.getSeconds() + n);
    else if (/minute|min/.test(unit)) d.setMinutes(d.getMinutes() + n);
    else if (/hour/.test(unit)) d.setHours(d.getHours() + n);
    else if (/day/.test(unit)) d.setDate(d.getDate() + n);
    else if (/week/.test(unit)) d.setDate(d.getDate() + n * 7);
    return d;
  }
  m = s.match(/^(\d+)\s*(秒|分钟|分|小时|天|周)(后)$/);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2];
    const d = new Date(baseDate);
    if (unit === '秒') d.setSeconds(d.getSeconds() + n);
    else if (unit === '分钟' || unit === '分') d.setMinutes(d.getMinutes() + n);
    else if (unit === '小时') d.setHours(d.getHours() + n);
    else if (unit === '天') d.setDate(d.getDate() + n);
    else if (unit === '周') d.setDate(d.getDate() + n * 7);
    return d;
  }
  m = s.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (m) return nextDow(baseDate, enWeekMap[m[1]]);
  m = s.match(/^下(周[日一二三四五六]|星期[天一二三四五六])$/);
  if (m) return nextDow(baseDate, zhWeekMap[m[1]]);
  return null;
}

function parseFull(t: string, baseDate: Date): Date | null {
  // 时间部分
  const parts = t.trim().split(/\s+/);
  let datePart = '',
    timePart = '';
  if (parts.length === 1) {
    datePart = parts[0];
  } else {
    datePart = parts.slice(0, -1).join(' ');
    timePart = parts[parts.length - 1];
  }

  // 纯时间
  const a1 = parseHhmm(timePart) || parseAmPm(timePart);
  // 日期
  let d = new Date(datePart);
  if (Number.isNaN(d.getTime())) {
    // 兼容 yyyy/MM/dd 或 yyyy.MM.dd
    const m = datePart.match(/^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})$/);
    if (m) d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  }
  if (Number.isNaN(d.getTime())) return null;

  if (a1) return setTime(d, a1.hh, a1.mm);
  if (assumeNoTimeTo.value) return setTime(d, 9, 0);
  return d;
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    const baseDt = base.value ? new Date(base.value) : new Date();
    let out: Date | null = null;
    // 先尝试相对表达
    out = parseRelative(text.value, baseDt);
    if (!out) {
      // 英文 next monday + time
      const lower = text.value.trim().toLowerCase();
      const wk = lower.match(/^(next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday))(?:\s+(.+))?$/);
      if (wk) {
        const d = nextDow(baseDt, enWeekMap[wk[2]]);
        if (wk[3]) {
          const tp = parseHhmm(wk[3]) || parseAmPm(wk[3]);
          out = tp ? setTime(d, tp.hh, tp.mm) : d;
        } else out = assumeNoTimeTo.value ? setTime(d, 9, 0) : d;
      }
    }
    if (!out) {
      // 中文：下周一 [时间]
      const m = text.value.trim().match(/^(下(周[日一二三四五六]|星期[天一二三四五六]))(?:\s+(.+))?$/);
      if (m) {
        const d = nextDow(baseDt, zhWeekMap[m[2]]);
        if (m[3]) {
          const tp = parseHhmm(m[3]);
          out = tp ? setTime(d, tp.hh, tp.mm) : d;
        } else out = assumeNoTimeTo.value ? setTime(d, 9, 0) : d;
      }
    }
    if (!out) {
      // 绝对日期(带/不带时间)
      out = parseFull(text.value, baseDt);
    }
    if (!out) throw new Error('无法解析');
    const payload = {
      input: text.value,
      base: baseDt.toISOString(),
      output: {
        iso: out.toISOString(),
        unix: Math.floor(out.getTime() / 1000),
        local: out.toLocaleString('zh-CN', { hour12: false })
      }
    };
    result.value = JSON.stringify(payload, null, 2);
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || '解析失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('natural-date-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
