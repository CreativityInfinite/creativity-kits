<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">通知测试 (Notification API)</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">标题</label>
              <input v-model="title" placeholder="标题" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">超时(秒)</label>
              <input v-model.number="timeoutSec" type="number" min="1" max="60" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">正文</label>
            <textarea v-model="body" rows="4" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="通知内容..." />
          </div>

          <div class="flex gap-2">
            <button @click="requestPermission" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">申请权限</button>
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">发送通知</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>

          <p class="text-xs text-gray-500">部分浏览器需要在安全环境(HTTPS)下才能显示通知。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="text-sm">
            权限状态：<span class="font-mono">{{ permission }}</span>
          </div>
          <div class="text-sm mt-1" v-if="lastStatus">
            发送状态：<span class="font-mono">{{ lastStatus }}</span>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">失败</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>

        <div v-if="history.length" class="space-y-2">
          <h3 class="font-medium">历史</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div v-for="(item, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
              <div class="flex justify-between">
                <div class="font-medium truncate">{{ item.title }}</div>
                <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
              </div>
              <div class="text-xs truncate">{{ item.body }}</div>
              <div class="flex gap-2 mt-2">
                <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
type HistoryItem = { title: string; body: string; timeoutSec: number; timestamp: number };

const title = ref('Hello');
const body = ref('这是一条通知');
const timeoutSec = ref(5);
const permission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
const lastStatus = ref('');
const error = ref('');
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => !!title.value.trim() && !!body.value.trim() && permission.value === 'granted');

function clearAll() {
  lastStatus.value = '';
  error.value = '';
}
async function requestPermission() {
  try {
    if (typeof Notification === 'undefined') {
      error.value = '当前环境不支持 Notification';
      return;
    }
    const p = await Notification.requestPermission();
    permission.value = p;
  } catch (e: any) {
    error.value = e?.message || '权限申请失败';
  }
}
function loadFromHistory(item: HistoryItem) {
  title.value = item.title;
  body.value = item.body;
  timeoutSec.value = item.timeoutSec;
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('notify-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function saveToHistory() {
  const item: HistoryItem = { title: title.value, body: body.value, timeoutSec: timeoutSec.value, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('notify-history', JSON.stringify(history.value));
}

function process() {
  error.value = '';
  lastStatus.value = '';
  try {
    if (typeof Notification === 'undefined') throw new Error('不支持 Notification');
    if (Notification.permission !== 'granted') throw new Error('权限未授予');
    const n = new Notification(title.value, { body: body.value });
    lastStatus.value = '已发送';
    saveToHistory();
    setTimeout(() => n.close(), Math.max(1, timeoutSec.value || 1) * 1000);
  } catch (e: any) {
    error.value = e?.message || '发送失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('notify-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
