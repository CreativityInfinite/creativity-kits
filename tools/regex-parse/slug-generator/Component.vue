<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Slug 生成器</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">输入文本</label>
            <textarea v-model="text" rows="6" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="示例：Hello 世界！这是一段标题" />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="lower" v-model="lowercase" type="checkbox" class="rounded mr-2" />
              <label for="lower" class="text-sm">小写</label>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">分隔符</label>
              <input v-model="sep" maxlength="3" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">最大长度</label>
              <input v-model.number="maxLen" type="number" min="1" step="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">生成</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">输出</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <input :value="result" readonly class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
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
            <div class="font-medium truncate">{{ h.summary }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
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
type HistoryItem = { summary: string; result: string; timestamp: number };

const text = ref('');
const lowercase = ref(true);
const sep = ref('-');
const maxLen = ref(80);

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
  const a = document.createElement('a');
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.value);
  a.download = 'slug.txt';
  a.click();
}
function saveToHistory() {
  if (!result.value) return;
  history.value.unshift({ summary: text.value.slice(0, 40), result: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('slug-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result;
  error.value = '';
  processingTime.value = null;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('slug-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

const translitMap: Record<string, string> = {
  // 常见中日韩等（极简近似）
  '，': ',',
  '。': '.',
  '！': '!',
  '？': '?',
  '：': ':',
  '；': ';',
  '（': '(',
  ')': '）',
  '【': '[',
  '】': ']',
  '《': '<',
  '》': '>',
  '“': '"',
  '”': '"',
  '‘': "'",
  '’': "'",
  '—': '-',
  '·': '-',
  '、': ',',
  丨: '|',
  '…': '...',
  '％': '%',
  '＃': '#',
  '＠': '@',
  '＆': '&',
  '＊': '*',
  '＋': '+',
  '＝': '=',
  '／': '/',
  '＼': '\\',
  '｜': '|',
  '～': '~'
};

function basicTranslit(s: string) {
  let out = s.normalize('NFKD');
  out = out.replace(/[\u0300-\u036f]/g, ''); // 去除音标
  out = out.replace(/[^\x00-\x7F]/g, (ch) => translitMap[ch] ?? ch); // 简化替换
  return out;
}

function toSlug(s: string, sepChar: string, lower: boolean, maxLenNum: number) {
  let out = basicTranslit(s);
  out = out.replace(/['"]/g, ''); // 去掉引号
  out = out.replace(/[^a-zA-Z0-9]+/g, sepChar); // 非字母数字替换为分隔符
  out = out.replace(new RegExp('\\' + sepChar + '+', 'g'), sepChar); // 连续分隔符合并
  out = out.replace(new RegExp('^\\' + sepChar + '|\\' + sepChar + '$', 'g'), ''); // 去首尾
  if (lower) out = out.toLowerCase();
  if (maxLenNum > 0 && out.length > maxLenNum) out = out.slice(0, maxLenNum).replace(new RegExp('\\' + sepChar + '+$', ''), '');
  return out;
}

function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const t0 = performance.now();
  try {
    const slug = toSlug(text.value, sep.value || '-', !!lowercase.value, maxLen.value || 0);
    if (!slug) throw new Error('无法生成有效 slug（请更换输入或分隔符）');
    result.value = slug;
    processingTime.value = Math.round(performance.now() - t0);
  } catch (e: any) {
    error.value = e?.message || '生成失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('slug-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
