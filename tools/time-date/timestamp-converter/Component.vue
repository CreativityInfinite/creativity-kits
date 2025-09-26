<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">时间戳转换器</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">当前时间</h4>
            <button @click="refreshCurrentTime" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">刷新</button>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Unix 时间戳 (秒)</div>
                <div class="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">{{ currentTime.unix }}</div>
              </div>
              <div>
                <div class="text-gray-500">Unix 时间戳 (毫秒)</div>
                <div class="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">{{ currentTime.unixMs }}</div>
              </div>
              <div>
                <div class="text-gray-500">ISO 8601</div>
                <div class="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">{{ currentTime.iso }}</div>
              </div>
              <div>
                <div class="text-gray-500">本地时间</div>
                <div class="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">{{ currentTime.local }}</div>
              </div>
            </div>

            <div class="flex gap-2">
              <button @click="copyText(currentTime.unix.toString())" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">复制Unix</button>
              <button @click="copyText(currentTime.unixMs.toString())" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">复制毫秒</button>
              <button @click="copyText(currentTime.iso)" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">复制ISO</button>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <h4 class="font-medium mb-3">时间戳转换</h4>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">输入时间戳</label>
              <div class="flex gap-2">
                <input
                  v-model="inputTimestamp"
                  type="text"
                  placeholder="输入Unix时间戳 (秒或毫秒)"
                  class="flex-1 px-3 py-2 border rounded-lg font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="convertFromTimestamp"
                />
                <button @click="useCurrentTimestamp" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">当前</button>
              </div>
              <div class="text-xs text-gray-500 mt-1">支持10位(秒)或13位(毫秒)时间戳</div>
            </div>

            <div v-if="timestampResult" class="space-y-3">
              <div class="grid grid-cols-1 gap-3">
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">本地时间</div>
                  <div class="font-mono text-sm">{{ timestampResult.local }}</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">UTC 时间</div>
                  <div class="font-mono text-sm">{{ timestampResult.utc }}</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">ISO 8601</div>
                  <div class="font-mono text-sm">{{ timestampResult.iso }}</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">相对时间</div>
                  <div class="font-mono text-sm">{{ timestampResult.relative }}</div>
                </div>
              </div>

              <div class="flex gap-2 flex-wrap">
                <button @click="copyText(timestampResult.local)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制本地</button>
                <button @click="copyText(timestampResult.utc)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制UTC</button>
                <button @click="copyText(timestampResult.iso)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制ISO</button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <h4 class="font-medium mb-3">日期时间转换</h4>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">输入日期时间</label>
              <input v-model="inputDateTime" type="datetime-local" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" @input="convertFromDateTime" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">或输入文本格式</label>
              <input
                v-model="inputDateText"
                type="text"
                placeholder="如: 2024-01-01 12:00:00 或 Jan 1, 2024"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="convertFromDateText"
              />
              <div class="text-xs text-gray-500 mt-1">支持多种日期格式，如 YYYY-MM-DD HH:mm:ss, MM/DD/YYYY 等</div>
            </div>

            <div v-if="dateTimeResult" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">Unix 时间戳 (秒)</div>
                  <div class="font-mono text-sm">{{ dateTimeResult.unix }}</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">Unix 时间戳 (毫秒)</div>
                  <div class="font-mono text-sm">{{ dateTimeResult.unixMs }}</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">ISO 8601</div>
                  <div class="font-mono text-sm">{{ dateTimeResult.iso }}</div>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="text-sm font-medium mb-1">相对时间</div>
                  <div class="font-mono text-sm">{{ dateTimeResult.relative }}</div>
                </div>
              </div>

              <div class="flex gap-2 flex-wrap">
                <button @click="copyText(dateTimeResult.unix.toString())" class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs">复制Unix</button>
                <button @click="copyText(dateTimeResult.unixMs.toString())" class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs">复制毫秒</button>
                <button @click="copyText(dateTimeResult.iso)" class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs">复制ISO</button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">时区转换</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">源时区</label>
                <select v-model="timezoneConversion.from" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="convertTimezone">
                  <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
                    {{ tz.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">目标时区</label>
                <select v-model="timezoneConversion.to" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="convertTimezone">
                  <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
                    {{ tz.label }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <input
                v-model="timezoneConversion.input"
                type="datetime-local"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="convertTimezone"
              />
            </div>

            <div v-if="timezoneConversion.result" class="p-3 bg-white dark:bg-gray-700 rounded border">
              <div class="text-sm font-medium mb-1">转换结果</div>
              <div class="font-mono text-sm">{{ timezoneConversion.result }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">批量转换</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">批量时间戳转换</h4>
            <div class="flex gap-2">
              <button @click="processBatch" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">转换</button>
              <button @click="clearBatch" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">输入时间戳列表 (每行一个)</label>
              <textarea
                v-model="batchInput"
                rows="6"
                placeholder="1640995200&#10;1641081600&#10;1641168000"
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <div v-if="batchResults.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="(result, index) in batchResults" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                <div class="font-mono font-medium">{{ result.input }}</div>
                <div class="text-gray-600 dark:text-gray-400">{{ result.output }}</div>
              </div>
            </div>

            <div v-if="batchResults.length > 0" class="flex gap-2">
              <button @click="copyBatchResults" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">复制结果</button>
              <button @click="exportBatchResults" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">导出CSV</button>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">时间格式示例</h4>
          </div>
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-1 gap-3 text-sm">
              <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="font-medium">Unix 时间戳 (秒)</div>
                <div class="font-mono text-gray-600 dark:text-gray-400">1640995200</div>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="font-medium">Unix 时间戳 (毫秒)</div>
                <div class="font-mono text-gray-600 dark:text-gray-400">1640995200000</div>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="font-medium">ISO 8601</div>
                <div class="font-mono text-gray-600 dark:text-gray-400">2022-01-01T00:00:00.000Z</div>
              </div>
              <div class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="font-medium">RFC 2822</div>
                <div class="font-mono text-gray-600 dark:text-gray-400">Sat, 01 Jan 2022 00:00:00 GMT</div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">转换历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="conversionHistory.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div v-for="(history, index) in conversionHistory.slice(0, 10)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.input }}</div>
                  <div class="text-xs text-gray-500">{{ history.output }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="copyText(history.input)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无转换历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">时间戳格式</h4>
          <ul class="space-y-1">
            <li>• <strong>Unix 时间戳:</strong> 从1970年1月1日开始的秒数</li>
            <li>• <strong>毫秒时间戳:</strong> Unix时间戳 × 1000</li>
            <li>• <strong>ISO 8601:</strong> 国际标准时间格式</li>
            <li>• <strong>相对时间:</strong> 如"2小时前"、"明天"</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">转换功能</h4>
          <ul class="space-y-1">
            <li>• 时间戳 ↔ 人类可读时间</li>
            <li>• 支持秒级和毫秒级时间戳</li>
            <li>• 多种日期格式输入</li>
            <li>• 时区转换</li>
            <li>• 批量处理</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">实用功能</h4>
          <ul class="space-y-1">
            <li>• 实时显示当前时间戳</li>
            <li>• 一键复制各种格式</li>
            <li>• 转换历史记录</li>
            <li>• CSV 导出功能</li>
            <li>• 常用时区快速转换</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TimestampResult {
  local: string
  utc: string
  iso: string
  relative: string
}

interface DateTimeResult {
  unix: number
  unixMs: number
  iso: string
  relative: string
}

interface BatchResult {
  input: string
  output: string
}

interface ConversionHistory {
  input: string
  output: string
  timestamp: string
}

const currentTime = ref({
  unix: 0,
  unixMs: 0,
  iso: '',
  local: ''
})

const inputTimestamp = ref('')
const timestampResult = ref<TimestampResult | null>(null)

const inputDateTime = ref('')
const inputDateText = ref('')
const dateTimeResult = ref<DateTimeResult | null>(null)

const batchInput = ref('')
const batchResults = ref<BatchResult[]>([])

const conversionHistory = ref<ConversionHistory[]>([])

const timezoneConversion = ref({
  from: 'Asia/Shanghai',
  to: 'America/New_York',
  input: '',
  result: ''
})

const commonTimezones = [
  { value: 'UTC', label: 'UTC (协调世界时)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (北京时间)' },
  { value: 'America/New_York', label: 'America/New_York (纽约)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (洛杉矶)' },
  { value: 'Europe/London', label: 'Europe/London (伦敦)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (巴黎)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (东京)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (首尔)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (悉尼)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (迪拜)' }
]

let timeInterval: NodeJS.Timeout | null = null

onMounted(() => {
  loadConversionHistory()
  updateCurrentTime()
  // 每秒更新当前时间
  timeInterval = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

function updateCurrentTime() {
  const now = new Date()
  currentTime.value = {
    unix: Math.floor(now.getTime() / 1000),
    unixMs: now.getTime(),
    iso: now.toISOString(),
    local: now.toLocaleString()
  }
}

function refreshCurrentTime() {
  updateCurrentTime()
}

function useCurrentTimestamp() {
  inputTimestamp.value = currentTime.value.unix.toString()
  convertFromTimestamp()
}

function convertFromTimestamp() {
  const input = inputTimestamp.value.trim()
  if (!input) {
    timestampResult.value = null
    return
  }

  try {
    let timestamp = parseInt(input)

    // 判断是秒还是毫秒
    if (timestamp.toString().length === 10) {
      // 秒级时间戳
      timestamp = timestamp * 1000
    } else if (timestamp.toString().length !== 13) {
      // 无效的时间戳长度
      timestampResult.value = null
      return
    }

    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
      timestampResult.value = null
      return
    }

    timestampResult.value = {
      local: date.toLocaleString(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      relative: getRelativeTime(date)
    }

    // 添加到历史记录
    addToHistory(input, date.toLocaleString())
  } catch (error) {
    timestampResult.value = null
  }
}

function convertFromDateTime() {
  const input = inputDateTime.value
  if (!input) {
    dateTimeResult.value = null
    return
  }

  try {
    const date = new Date(input)

    if (isNaN(date.getTime())) {
      dateTimeResult.value = null
      return
    }

    dateTimeResult.value = {
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      iso: date.toISOString(),
      relative: getRelativeTime(date)
    }

    // 添加到历史记录
    addToHistory(input, Math.floor(date.getTime() / 1000).toString())
  } catch (error) {
    dateTimeResult.value = null
  }
}

function convertFromDateText() {
  const input = inputDateText.value.trim()
  if (!input) {
    dateTimeResult.value = null
    return
  }

  try {
    const date = new Date(input)

    if (isNaN(date.getTime())) {
      dateTimeResult.value = null
      return
    }

    dateTimeResult.value = {
      unix: Math.floor(date.getTime() / 1000),
      unixMs: date.getTime(),
      iso: date.toISOString(),
      relative: getRelativeTime(date)
    }

    // 添加到历史记录
    addToHistory(input, Math.floor(date.getTime() / 1000).toString())
  } catch (error) {
    dateTimeResult.value = null
  }
}

function convertTimezone() {
  const input = timezoneConversion.value.input
  if (!input) {
    timezoneConversion.value.result = ''
    return
  }

  try {
    const date = new Date(input)

    if (isNaN(date.getTime())) {
      timezoneConversion.value.result = '无效的日期时间'
      return
    }

    // 简化的时区转换（实际应用中可能需要更复杂的时区库）
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezoneConversion.value.to,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }

    timezoneConversion.value.result = date.toLocaleString('zh-CN', options)
  } catch (error) {
    timezoneConversion.value.result = '转换失败'
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (Math.abs(diffSeconds) < 60) {
    return diffSeconds >= 0 ? '刚刚' : '即将'
  } else if (Math.abs(diffMinutes) < 60) {
    return diffMinutes >= 0 ? `${diffMinutes}分钟前` : `${Math.abs(diffMinutes)}分钟后`
  } else if (Math.abs(diffHours) < 24) {
    return diffHours >= 0 ? `${diffHours}小时前` : `${Math.abs(diffHours)}小时后`
  } else if (Math.abs(diffDays) < 30) {
    return diffDays >= 0 ? `${diffDays}天前` : `${Math.abs(diffDays)}天后`
  } else {
    return date.toLocaleDateString()
  }
}

function processBatch() {
  const lines = batchInput.value
    .trim()
    .split('\n')
    .filter((line) => line.trim())
  const results: BatchResult[] = []

  for (const line of lines) {
    const input = line.trim()
    try {
      let timestamp = parseInt(input)

      // 判断是秒还是毫秒
      if (timestamp.toString().length === 10) {
        timestamp = timestamp * 1000
      } else if (timestamp.toString().length !== 13) {
        results.push({
          input,
          output: '无效的时间戳格式'
        })
        continue
      }

      const date = new Date(timestamp)

      if (isNaN(date.getTime())) {
        results.push({
          input,
          output: '无效的时间戳'
        })
        continue
      }

      results.push({
        input,
        output: date.toLocaleString()
      })
    } catch (error) {
      results.push({
        input,
        output: '转换失败'
      })
    }
  }

  batchResults.value = results
}

function clearBatch() {
  batchInput.value = ''
  batchResults.value = []
}

async function copyBatchResults() {
  const content = batchResults.value.map((r) => `${r.input}\t${r.output}`).join('\n')
  try {
    await navigator.clipboard.writeText(content)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function exportBatchResults() {
  const csvContent = 'Timestamp,DateTime\n' + batchResults.value.map((r) => `"${r.input}","${r.output}"`).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `timestamp-conversion-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function addToHistory(input: string, output: string) {
  const historyItem: ConversionHistory = {
    input,
    output,
    timestamp: new Date().toLocaleString()
  }

  conversionHistory.value.unshift(historyItem)
  conversionHistory.value = conversionHistory.value.slice(0, 50) // 限制历史记录数量
  saveConversionHistory()
}

function clearHistory() {
  conversionHistory.value = []
  saveConversionHistory()
}

function loadConversionHistory() {
  try {
    const saved = localStorage.getItem('timestamp-converter-history')
    if (saved) {
      conversionHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载转换历史失败:', error)
  }
}

function saveConversionHistory() {
  try {
    localStorage.setItem('timestamp-converter-history', JSON.stringify(conversionHistory.value))
  } catch (error) {
    console.error('保存转换历史失败:', error)
  }
}
</script>
