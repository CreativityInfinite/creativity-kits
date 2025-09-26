<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Cron 表达式验证器</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">Cron 表达式</label>
            <input
              v-model="cronExpression"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              placeholder="输入 Cron 表达式，如: 0 9 * * 1-5"
              @input="validateCron"
            />
            <div v-if="error" class="text-red-500 text-xs mt-1">
              {{ error }}
            </div>
            <div v-else-if="cronExpression && isValid" class="text-green-500 text-xs mt-1">✓ Cron 表达式格式正确</div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">字段说明</h4>
            <div class="grid grid-cols-5 gap-2 text-xs">
              <div class="text-center">
                <div class="font-medium">分钟</div>
                <div class="text-gray-500">0-59</div>
              </div>
              <div class="text-center">
                <div class="font-medium">小时</div>
                <div class="text-gray-500">0-23</div>
              </div>
              <div class="text-center">
                <div class="font-medium">日期</div>
                <div class="text-gray-500">1-31</div>
              </div>
              <div class="text-center">
                <div class="font-medium">月份</div>
                <div class="text-gray-500">1-12</div>
              </div>
              <div class="text-center">
                <div class="font-medium">星期</div>
                <div class="text-gray-500">0-7</div>
              </div>
            </div>
          </div>

          <div v-if="isValid && cronExpression" class="space-y-3">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 class="font-medium mb-2">表达式解析</h4>
              <div class="text-sm space-y-1">
                <div><strong>描述:</strong> {{ description }}</div>
                <div><strong>频率:</strong> {{ frequency }}</div>
              </div>
            </div>

            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 class="font-medium mb-2">字段详解</h4>
              <div class="space-y-2 text-sm">
                <div class="grid grid-cols-2 gap-2">
                  <span>分钟:</span>
                  <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ fields.minute }}</code>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <span>小时:</span>
                  <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ fields.hour }}</code>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <span>日期:</span>
                  <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ fields.day }}</code>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <span>月份:</span>
                  <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ fields.month }}</code>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <span>星期:</span>
                  <code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ fields.weekday }}</code>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="validateCron" :disabled="!cronExpression" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">验证表达式</button>
            <button @click="loadExample" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">加载示例</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">执行时间预览</h3>

        <div v-if="isValid && cronExpression" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">接下来的执行时间</h4>
              <button @click="generateNextRuns" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">刷新</button>
            </div>

            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="(time, index) in nextRuns" :key="index" class="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded text-sm">
                <span class="font-mono">{{ time.formatted }}</span>
                <span class="text-gray-500">{{ time.relative }}</span>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">执行统计</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>每小时执行次数:</span>
                <span class="font-medium">{{ statistics.perHour }}</span>
              </div>
              <div class="flex justify-between">
                <span>每天执行次数:</span>
                <span class="font-medium">{{ statistics.perDay }}</span>
              </div>
              <div class="flex justify-between">
                <span>每周执行次数:</span>
                <span class="font-medium">{{ statistics.perWeek }}</span>
              </div>
              <div class="flex justify-between">
                <span>每月执行次数:</span>
                <span class="font-medium">{{ statistics.perMonth }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="copyExpression" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">复制表达式</button>
            <button @click="exportSchedule" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">导出计划</button>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">⏰</div>
          <div class="text-lg mb-2">Cron 表达式验证器</div>
          <div class="text-sm">输入 Cron 表达式查看执行计划</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">常用 Cron 表达式</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="example in cronExamples"
            :key="example.expression"
            class="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            @click="loadCronExample(example)"
          >
            <div>
              <div class="font-medium text-sm">{{ example.description }}</div>
              <code class="text-xs text-gray-500">{{ example.expression }}</code>
            </div>
            <button class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">使用</button>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">特殊字符说明</h3>
        <div class="space-y-2 text-sm max-h-48 overflow-y-auto">
          <div v-for="symbol in cronSymbols" :key="symbol.char" class="flex justify-between">
            <code class="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">{{ symbol.char }}</code>
            <span class="text-gray-600 dark:text-gray-400">{{ symbol.description }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CronExample {
  expression: string
  description: string
}

interface CronSymbol {
  char: string
  description: string
}

interface NextRun {
  date: Date
  formatted: string
  relative: string
}

interface CronFields {
  minute: string
  hour: string
  day: string
  month: string
  weekday: string
}

interface Statistics {
  perHour: number
  perDay: number
  perWeek: number
  perMonth: number
}

const cronExpression = ref('')
const error = ref('')
const isValid = ref(false)
const nextRuns = ref<NextRun[]>([])

const cronExamples: CronExample[] = [
  { expression: '0 9 * * 1-5', description: '工作日上午9点' },
  { expression: '0 0 * * 0', description: '每周日午夜' },
  { expression: '0 0 1 * *', description: '每月1号午夜' },
  { expression: '*/15 * * * *', description: '每15分钟' },
  { expression: '0 */2 * * *', description: '每2小时' },
  { expression: '30 8 * * 1-5', description: '工作日上午8:30' },
  { expression: '0 12 * * *', description: '每天中午12点' },
  { expression: '0 0 * * 6', description: '每周六午夜' },
  { expression: '0 6 1,15 * *', description: '每月1号和15号早上6点' },
  { expression: '*/5 * * * *', description: '每5分钟' },
  { expression: '0 22 * * 1-5', description: '工作日晚上10点' },
  { expression: '0 0 1 1 *', description: '每年1月1号午夜' }
]

const cronSymbols: CronSymbol[] = [
  { char: '*', description: '匹配任何值' },
  { char: '?', description: '不指定值（日期和星期）' },
  { char: '-', description: '范围，如 1-5' },
  { char: ',', description: '列表，如 1,3,5' },
  { char: '/', description: '步长，如 */5' },
  { char: 'L', description: '最后一天' },
  { char: 'W', description: '工作日' },
  { char: '#', description: '第几个星期几' }
]

const fields = computed((): CronFields => {
  if (!cronExpression.value) {
    return { minute: '', hour: '', day: '', month: '', weekday: '' }
  }

  const parts = cronExpression.value.trim().split(/\s+/)
  if (parts.length !== 5) {
    return { minute: '', hour: '', day: '', month: '', weekday: '' }
  }

  return {
    minute: parts[0],
    hour: parts[1],
    day: parts[2],
    month: parts[3],
    weekday: parts[4]
  }
})

const description = computed((): string => {
  if (!isValid.value) return ''

  const f = fields.value
  let desc = '执行时间: '

  // 分钟
  if (f.minute === '*') {
    desc += '每分钟'
  } else if (f.minute.includes('/')) {
    const step = f.minute.split('/')[1]
    desc += `每${step}分钟`
  } else if (f.minute.includes(',')) {
    desc += `第${f.minute}分钟`
  } else {
    desc += `第${f.minute}分钟`
  }

  // 小时
  if (f.hour === '*') {
    desc += '的每小时'
  } else if (f.hour.includes('/')) {
    const step = f.hour.split('/')[1]
    desc += `，每${step}小时`
  } else if (f.hour.includes(',')) {
    desc += `，在${f.hour}点`
  } else if (f.hour.includes('-')) {
    desc += `，在${f.hour}点之间`
  } else {
    desc += `，在${f.hour}点`
  }

  // 日期
  if (f.day === '*') {
    desc += '的每天'
  } else if (f.day.includes(',')) {
    desc += `，每月${f.day}号`
  } else if (f.day.includes('-')) {
    desc += `，每月${f.day}号之间`
  } else {
    desc += `，每月${f.day}号`
  }

  // 月份
  if (f.month !== '*') {
    if (f.month.includes(',')) {
      desc += `，在${f.month}月`
    } else if (f.month.includes('-')) {
      desc += `，在${f.month}月之间`
    } else {
      desc += `，在${f.month}月`
    }
  }

  // 星期
  if (f.weekday !== '*') {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六', '日']
    if (f.weekday.includes(',')) {
      const days = f.weekday
        .split(',')
        .map((d) => `周${weekdays[parseInt(d)]}`)
        .join('、')
      desc += `，在${days}`
    } else if (f.weekday.includes('-')) {
      const [start, end] = f.weekday.split('-')
      desc += `，在周${weekdays[parseInt(start)]}到周${weekdays[parseInt(end)]}`
    } else {
      desc += `，在周${weekdays[parseInt(f.weekday)]}`
    }
  }

  return desc
})

const frequency = computed((): string => {
  if (!isValid.value) return ''

  const stats = statistics.value

  if (stats.perMonth >= 30 * 24 * 60) return '每分钟'
  if (stats.perMonth >= 30 * 24) return '每小时'
  if (stats.perMonth >= 30) return '每天'
  if (stats.perMonth >= 4) return '每周'
  return '每月'
})

const statistics = computed((): Statistics => {
  if (!isValid.value) {
    return { perHour: 0, perDay: 0, perWeek: 0, perMonth: 0 }
  }

  const f = fields.value

  // 计算每小时执行次数
  let minuteCount = 1
  if (f.minute === '*') minuteCount = 60
  else if (f.minute.includes('/')) minuteCount = 60 / parseInt(f.minute.split('/')[1])
  else if (f.minute.includes(',')) minuteCount = f.minute.split(',').length

  let hourCount = 1
  if (f.hour === '*') hourCount = 24
  else if (f.hour.includes('/')) hourCount = 24 / parseInt(f.hour.split('/')[1])
  else if (f.hour.includes(',')) hourCount = f.hour.split(',').length
  else if (f.hour.includes('-')) {
    const [start, end] = f.hour.split('-').map(Number)
    hourCount = end - start + 1
  }

  const perHour = f.hour === '*' ? minuteCount : 0
  const perDay = minuteCount * (f.hour === '*' ? 24 : hourCount)
  const perWeek = perDay * 7
  const perMonth = perDay * 30

  return {
    perHour: Math.round(perHour),
    perDay: Math.round(perDay),
    perWeek: Math.round(perWeek),
    perMonth: Math.round(perMonth)
  }
})

function validateCron() {
  error.value = ''
  isValid.value = false

  if (!cronExpression.value.trim()) return

  const parts = cronExpression.value.trim().split(/\s+/)

  if (parts.length !== 5) {
    error.value = 'Cron 表达式必须包含5个字段（分钟 小时 日期 月份 星期）'
    return
  }

  try {
    // 验证分钟 (0-59)
    if (!validateField(parts[0], 0, 59)) {
      error.value = '分钟字段无效，应为 0-59'
      return
    }

    // 验证小时 (0-23)
    if (!validateField(parts[1], 0, 23)) {
      error.value = '小时字段无效，应为 0-23'
      return
    }

    // 验证日期 (1-31)
    if (!validateField(parts[2], 1, 31)) {
      error.value = '日期字段无效，应为 1-31'
      return
    }

    // 验证月份 (1-12)
    if (!validateField(parts[3], 1, 12)) {
      error.value = '月份字段无效，应为 1-12'
      return
    }

    // 验证星期 (0-7)
    if (!validateField(parts[4], 0, 7)) {
      error.value = '星期字段无效，应为 0-7（0和7都表示周日）'
      return
    }

    isValid.value = true
    generateNextRuns()
  } catch (err) {
    error.value = '表达式格式错误'
  }
}

function validateField(field: string, min: number, max: number): boolean {
  if (field === '*') return true

  // 处理步长 */n
  if (field.includes('/')) {
    const [range, step] = field.split('/')
    if (range !== '*' && !validateField(range, min, max)) return false
    const stepNum = parseInt(step)
    return !isNaN(stepNum) && stepNum > 0 && stepNum <= max
  }

  // 处理范围 n-m
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number)
    return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end
  }

  // 处理列表 n,m,o
  if (field.includes(',')) {
    const values = field.split(',').map(Number)
    return values.every((val) => !isNaN(val) && val >= min && val <= max)
  }

  // 单个数值
  const num = parseInt(field)
  return !isNaN(num) && num >= min && num <= max
}

function generateNextRuns() {
  if (!isValid.value) return

  nextRuns.value = []
  const now = new Date()
  let current = new Date(now)

  // 生成接下来的10次执行时间
  for (let i = 0; i < 10; i++) {
    const next = getNextRun(current)
    if (next) {
      nextRuns.value.push({
        date: next,
        formatted: next.toLocaleString('zh-CN'),
        relative: getRelativeTime(next)
      })
      current = new Date(next.getTime() + 60000) // 加1分钟避免重复
    } else {
      break
    }
  }
}

function getNextRun(from: Date): Date | null {
  const f = fields.value
  let next = new Date(from)

  // 简化的下次执行时间计算
  // 这里只是一个基本实现，实际的 cron 解析会更复杂

  for (let attempts = 0; attempts < 366 * 24 * 60; attempts++) {
    if (matchesCron(next, f)) {
      return next
    }
    next = new Date(next.getTime() + 60000) // 每次增加1分钟
  }

  return null
}

function matchesCron(date: Date, fields: CronFields): boolean {
  const minute = date.getMinutes()
  const hour = date.getHours()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const weekday = date.getDay()

  return (
    matchesField(minute, fields.minute, 0, 59) &&
    matchesField(hour, fields.hour, 0, 23) &&
    matchesField(day, fields.day, 1, 31) &&
    matchesField(month, fields.month, 1, 12) &&
    matchesField(weekday, fields.weekday, 0, 7)
  )
}

function matchesField(value: number, field: string, min: number, max: number): boolean {
  if (field === '*') return true

  // 处理星期的特殊情况（7也表示周日）
  if (max === 7 && value === 0 && field.includes('7')) {
    field = field.replace('7', '0')
  }

  if (field.includes('/')) {
    const [range, step] = field.split('/')
    const stepNum = parseInt(step)
    if (range === '*') {
      return value % stepNum === 0
    }
    // 处理范围步长
    return matchesField(value, range, min, max) && value % stepNum === 0
  }

  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number)
    return value >= start && value <= end
  }

  if (field.includes(',')) {
    const values = field.split(',').map(Number)
    return values.includes(value)
  }

  return value === parseInt(field)
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff < 0) return '已过期'

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天后`
  if (hours > 0) return `${hours}小时后`
  if (minutes > 0) return `${minutes}分钟后`
  return '即将执行'
}

function loadExample() {
  const example = cronExamples[Math.floor(Math.random() * cronExamples.length)]
  loadCronExample(example)
}

function loadCronExample(example: CronExample) {
  cronExpression.value = example.expression
  validateCron()
}

function clearAll() {
  cronExpression.value = ''
  error.value = ''
  isValid.value = false
  nextRuns.value = []
}

function copyExpression() {
  navigator.clipboard
    .writeText(cronExpression.value)
    .then(() => {
      // 可以添加成功提示
    })
    .catch((err) => {
      console.error('复制失败:', err)
    })
}

function exportSchedule() {
  if (!isValid.value) return

  const report = `Cron 表达式执行计划
表达式: ${cronExpression.value}
描述: ${description.value}
频率: ${frequency.value}

执行统计:
- 每小时: ${statistics.value.perHour} 次
- 每天: ${statistics.value.perDay} 次
- 每周: ${statistics.value.perWeek} 次
- 每月: ${statistics.value.perMonth} 次

接下来的执行时间:
${nextRuns.value.map((run, index) => `${index + 1}. ${run.formatted} (${run.relative})`).join('\n')}

生成时间: ${new Date().toLocaleString('zh-CN')}
`

  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cron-schedule-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
