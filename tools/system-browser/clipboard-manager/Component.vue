<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">{{ $t('tools.clipboard-manager.page.title') }}</h2>
      <div class="flex gap-2">
        <button @click="clearHistory" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">{{ $t('tools.clipboard-manager.page.clearHistory') }}</button>
        <button @click="toggleAutoSave" :class="['px-3 py-2 rounded-md text-sm', autoSave ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700']">
          {{ autoSave ? $t('tools.clipboard-manager.page.autoSaveOn') : $t('tools.clipboard-manager.page.autoSaveOff') }}
        </button>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">{{ $t('tools.clipboard-manager.page.currentClipboard') }}</span>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded p-3 border">
        <div v-if="currentClipboard" class="space-y-2">
          <div class="flex justify-between items-start">
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(currentClipboard.timestamp) }} | {{ currentClipboard.type }}</div>
            <button @click="copyToClipboard(currentClipboard.content)" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">{{ $t('tools.clipboard-manager.page.copy') }}</button>
          </div>
          <div class="text-sm font-mono bg-gray-50 dark:bg-gray-700 rounded p-2 max-h-20 overflow-y-auto">
            {{ truncateText(currentClipboard.content, 200) }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{{ $t('tools.clipboard-manager.page.noClipboard') }}</div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <h3 class="font-medium">{{ $t('tools.clipboard-manager.page.historyTitle') }} ({{ clipboardHistory.length }})</h3>
        <div class="flex gap-2">
          <select v-model="filterType" class="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="all">{{ $t('tools.clipboard-manager.page.filter.all') }}</option>
            <option value="text">{{ $t('tools.clipboard-manager.page.filter.text') }}</option>
            <option value="url">{{ $t('tools.clipboard-manager.page.filter.url') }}</option>
            <option value="email">{{ $t('tools.clipboard-manager.page.filter.email') }}</option>
            <option value="number">{{ $t('tools.clipboard-manager.page.filter.number') }}</option>
          </select>
          <input
            v-model="searchQuery"
            :placeholder="$t('tools.clipboard-manager.page.searchPlaceholder')"
            class="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div v-for="(item, index) in filteredHistory" :key="index" class="bg-white dark:bg-gray-800 rounded-lg p-3 border hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
          <div class="flex justify-between items-start mb-2">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full" :class="getTypeColor(item.type)"></div>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(item.timestamp) }}
              </span>
              <span class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {{ item.type }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400"> {{ item.content.length }} {{ $t('tools.clipboard-manager.page.chars') }} </span>
            </div>
            <div class="flex gap-1">
              <button @click="copyToClipboard(item.content)" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                {{ $t('tools.clipboard-manager.page.copy') }}
              </button>
              <button @click="removeItem(index)" class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                {{ $t('tools.clipboard-manager.page.delete') }}
              </button>
            </div>
          </div>
          <div class="text-sm font-mono bg-gray-50 dark:bg-gray-700 rounded p-2">
            {{ truncateText(item.content, 150) }}
          </div>
        </div>

        <div v-if="filteredHistory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-2">📋</div>
          <div>{{ searchQuery || filterType !== 'all' ? $t('tools.clipboard-manager.page.empty.searchNoMatch') : $t('tools.clipboard-manager.page.empty.noHistory') }}</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-2">{{ $t('tools.clipboard-manager.page.guide.title') }}</h3>
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <li>• {{ $t('tools.clipboard-manager.page.guide.tips.autoSave') }}</li>
        <li>• {{ $t('tools.clipboard-manager.page.guide.tips.types') }}</li>
        <li>• {{ $t('tools.clipboard-manager.page.guide.tips.filterSearch') }}</li>
        <li>• {{ $t('tools.clipboard-manager.page.guide.tips.copy') }}</li>
        <li>• {{ $t('tools.clipboard-manager.page.guide.tips.local') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface ClipboardItem {
  content: string;
  type: string;
  timestamp: number;
}

const clipboardHistory = ref<ClipboardItem[]>([]);
const currentClipboard = ref<ClipboardItem | null>(null);
const autoSave = ref(true);
const searchQuery = ref('');
const filterType = ref('all');
let checkInterval: number | null = null;

const filteredHistory = computed(() => {
  let filtered = clipboardHistory.value;

  if (filterType.value !== 'all') {
    filtered = filtered.filter((item) => item.type === filterType.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) => item.content.toLowerCase().includes(query));
  }

  return filtered;
});

function detectContentType(content: string): string {
  // URL 检测
  if (/^https?:\/\//.test(content)) {
    return 'url';
  }

  // 邮箱检测
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.trim())) {
    return 'email';
  }

  // 数字检测
  if (/^\d+(\.\d+)?$/.test(content.trim())) {
    return 'number';
  }

  return 'text';
}

function getTypeColor(type: string): string {
  const colors = {
    text: 'bg-gray-400',
    url: 'bg-blue-400',
    email: 'bg-green-400',
    number: 'bg-purple-400'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-400';
}

const { t } = useI18n ? useI18n() : ({ t: (s: string) => s } as any);
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    // 1分钟内
    return t('tools.clipboard-manager.page.time.justNow');
  } else if (diff < 3600000) {
    // 1小时内
    return t('tools.clipboard-manager.page.time.minutesAgo', { n: Math.floor(diff / 60000) });
  } else if (diff < 86400000) {
    // 24小时内
    return t('tools.clipboard-manager.page.time.hoursAgo', { n: Math.floor(diff / 3600000) });
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

async function checkClipboard() {
  if (!autoSave.value) return;

  try {
    const text = await navigator.clipboard.readText();

    if (text && text !== currentClipboard.value?.content) {
      const newItem: ClipboardItem = {
        content: text,
        type: detectContentType(text),
        timestamp: Date.now()
      };

      currentClipboard.value = newItem;

      // 检查是否已存在相同内容
      const existingIndex = clipboardHistory.value.findIndex((item) => item.content === text);
      if (existingIndex !== -1) {
        // 移除旧记录，添加到最前面
        clipboardHistory.value.splice(existingIndex, 1);
      }

      clipboardHistory.value.unshift(newItem);

      // 限制历史记录数量
      if (clipboardHistory.value.length > 100) {
        clipboardHistory.value = clipboardHistory.value.slice(0, 100);
      }

      saveHistory();
    }
  } catch (error) {
    console.log(t('tools.clipboard-manager.page.error.readClipboardFailed'));
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);

    // 更新当前剪贴板内容
    currentClipboard.value = {
      content: text,
      type: detectContentType(text),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(t('tools.clipboard-manager.page.error.copyFailed'), error);
  }
}

function removeItem(index: number) {
  clipboardHistory.value.splice(index, 1);
  saveHistory();
}

function clearHistory() {
  clipboardHistory.value = [];
  saveHistory();
}

function toggleAutoSave() {
  autoSave.value = !autoSave.value;
  localStorage.setItem('clipboard-auto-save', autoSave.value.toString());

  if (autoSave.value) {
    startMonitoring();
  } else {
    stopMonitoring();
  }
}

function startMonitoring() {
  if (checkInterval) return;

  checkInterval = setInterval(checkClipboard, 1000); // 每秒检查一次
}

function stopMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

function saveHistory() {
  localStorage.setItem('clipboard-history', JSON.stringify(clipboardHistory.value));
}

function loadHistory() {
  const saved = localStorage.getItem('clipboard-history');
  if (saved) {
    clipboardHistory.value = JSON.parse(saved);
  }

  const savedAutoSave = localStorage.getItem('clipboard-auto-save');
  if (savedAutoSave !== null) {
    autoSave.value = savedAutoSave === 'true';
  }
}

// 请求剪贴板权限
async function requestClipboardPermission() {
  try {
    await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
  } catch (error) {
    console.log('剪贴板权限检查失败');
  }
}

onMounted(async () => {
  loadHistory();
  await requestClipboardPermission();

  if (autoSave.value) {
    startMonitoring();
  }

  // 初始检查当前剪贴板内容
  checkClipboard();
});

onUnmounted(() => {
  stopMonitoring();
  saveHistory();
});
</script>
