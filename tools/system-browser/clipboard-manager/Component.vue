<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">剪贴板历史管理器</h2>
      <div class="flex gap-2">
        <button @click="clearHistory" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">清空历史</button>
        <button @click="toggleAutoSave" :class="['px-3 py-2 rounded-md text-sm', autoSave ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700']">
          {{ autoSave ? '自动保存：开' : '自动保存：关' }}
        </button>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">当前剪贴板内容</span>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded p-3 border">
        <div v-if="currentClipboard" class="space-y-2">
          <div class="flex justify-between items-start">
            <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(currentClipboard.timestamp) }} | {{ currentClipboard.type }}</div>
            <button @click="copyToClipboard(currentClipboard.content)" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <div class="text-sm font-mono bg-gray-50 dark:bg-gray-700 rounded p-2 max-h-20 overflow-y-auto">
            {{ truncateText(currentClipboard.content, 200) }}
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">暂无剪贴板内容</div>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <h3 class="font-medium">历史记录 ({{ clipboardHistory.length }})</h3>
        <div class="flex gap-2">
          <select v-model="filterType" class="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="all">全部类型</option>
            <option value="text">文本</option>
            <option value="url">链接</option>
            <option value="email">邮箱</option>
            <option value="number">数字</option>
          </select>
          <input v-model="searchQuery" placeholder="搜索内容..." class="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
              <span class="text-xs text-gray-500 dark:text-gray-400"> {{ item.content.length }} 字符 </span>
            </div>
            <div class="flex gap-1">
              <button @click="copyToClipboard(item.content)" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                复制
              </button>
              <button @click="removeItem(index)" class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">删除</button>
            </div>
          </div>
          <div class="text-sm font-mono bg-gray-50 dark:bg-gray-700 rounded p-2">
            {{ truncateText(item.content, 150) }}
          </div>
        </div>

        <div v-if="filteredHistory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-2">📋</div>
          <div>{{ searchQuery || filterType !== 'all' ? '没有找到匹配的记录' : '暂无历史记录' }}</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-2">使用说明</h3>
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <li>• 开启自动保存后，每次复制内容都会自动记录到历史中</li>
        <li>• 支持文本、链接、邮箱、数字等不同类型的内容识别</li>
        <li>• 可以通过类型筛选和关键词搜索快速找到历史内容</li>
        <li>• 点击复制按钮可以将历史内容重新复制到剪贴板</li>
        <li>• 历史记录保存在本地存储中，不会上传到服务器</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface ClipboardItem {
  content: string
  type: string
  timestamp: number
}

const clipboardHistory = ref<ClipboardItem[]>([])
const currentClipboard = ref<ClipboardItem | null>(null)
const autoSave = ref(true)
const searchQuery = ref('')
const filterType = ref('all')
let checkInterval: number | null = null

const filteredHistory = computed(() => {
  let filtered = clipboardHistory.value

  if (filterType.value !== 'all') {
    filtered = filtered.filter((item) => item.type === filterType.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((item) => item.content.toLowerCase().includes(query))
  }

  return filtered
})

function detectContentType(content: string): string {
  // URL 检测
  if (/^https?:\/\//.test(content)) {
    return 'url'
  }

  // 邮箱检测
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.trim())) {
    return 'email'
  }

  // 数字检测
  if (/^\d+(\.\d+)?$/.test(content.trim())) {
    return 'number'
  }

  return 'text'
}

function getTypeColor(type: string): string {
  const colors = {
    text: 'bg-gray-400',
    url: 'bg-blue-400',
    email: 'bg-green-400',
    number: 'bg-purple-400'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-400'
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) {
    // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

async function checkClipboard() {
  if (!autoSave.value) return

  try {
    const text = await navigator.clipboard.readText()

    if (text && text !== currentClipboard.value?.content) {
      const newItem: ClipboardItem = {
        content: text,
        type: detectContentType(text),
        timestamp: Date.now()
      }

      currentClipboard.value = newItem

      // 检查是否已存在相同内容
      const existingIndex = clipboardHistory.value.findIndex((item) => item.content === text)
      if (existingIndex !== -1) {
        // 移除旧记录，添加到最前面
        clipboardHistory.value.splice(existingIndex, 1)
      }

      clipboardHistory.value.unshift(newItem)

      // 限制历史记录数量
      if (clipboardHistory.value.length > 100) {
        clipboardHistory.value = clipboardHistory.value.slice(0, 100)
      }

      saveHistory()
    }
  } catch (error) {
    console.log('无法读取剪贴板内容')
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)

    // 更新当前剪贴板内容
    currentClipboard.value = {
      content: text,
      type: detectContentType(text),
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function removeItem(index: number) {
  clipboardHistory.value.splice(index, 1)
  saveHistory()
}

function clearHistory() {
  clipboardHistory.value = []
  saveHistory()
}

function toggleAutoSave() {
  autoSave.value = !autoSave.value
  localStorage.setItem('clipboard-auto-save', autoSave.value.toString())

  if (autoSave.value) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}

function startMonitoring() {
  if (checkInterval) return

  checkInterval = setInterval(checkClipboard, 1000) // 每秒检查一次
}

function stopMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

function saveHistory() {
  localStorage.setItem('clipboard-history', JSON.stringify(clipboardHistory.value))
}

function loadHistory() {
  const saved = localStorage.getItem('clipboard-history')
  if (saved) {
    clipboardHistory.value = JSON.parse(saved)
  }

  const savedAutoSave = localStorage.getItem('clipboard-auto-save')
  if (savedAutoSave !== null) {
    autoSave.value = savedAutoSave === 'true'
  }
}

// 请求剪贴板权限
async function requestClipboardPermission() {
  try {
    await navigator.permissions.query({ name: 'clipboard-read' as PermissionName })
  } catch (error) {
    console.log('剪贴板权限检查失败')
  }
}

onMounted(async () => {
  loadHistory()
  await requestClipboardPermission()

  if (autoSave.value) {
    startMonitoring()
  }

  // 初始检查当前剪贴板内容
  checkClipboard()
})

onUnmounted(() => {
  stopMonitoring()
  saveHistory()
})
</script>
