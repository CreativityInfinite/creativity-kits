<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">JSON Schema 校验器</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">Schema（JSON）</label>
            <textarea
              v-model="schemaText"
              rows="8"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder='{"type":"object","properties":{"name":{"type":"string"}},"required":["name"]}'
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">数据（JSON 或每行一个 JSON）</label>
            <textarea v-model="dataText" rows="8" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder='{"name":"Alice"}&#10;{"name":123}' />
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">校验</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换视图</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">处理结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">结果 JSON</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>输出长度: {{ result.length }} 字符</div>
              <div v-if="processingTime">处理时间: {{ processingTime }}ms</div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🧩</div>
          <div class="text-lg mb-2">JSON Schema 校验</div>
          <div class="text-sm">支持 type/required/properties/items 基础规则</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">处理失败</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">操作历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div class="font-medium truncate">{{ item.title }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">提示</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• 非完整标准实现，覆盖常见约束，复杂规则请用专业校验器</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type HistoryItem = { title: string; result: string; timestamp: number }

const schemaText = ref('')
const dataText = ref('')
const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

const canProcess = computed(() => schemaText.value.trim().length > 0 && dataText.value.trim().length > 0)

function clearAll() {
  result.value = ''
  error.value = ''
  processingTime.value = null
}
function swapView() {
  if (result.value) copyResult()
}
function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板'))
}
function copyResult() {
  if (result.value) copyText(result.value)
}
function downloadResult() {
  if (!result.value) return
  const filename = `json_schema_${new Date().toISOString().slice(0, 10)}.json`
  const blob = new Blob([result.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
function saveToHistory() {
  if (!result.value) return
  const item: HistoryItem = { title: '校验结果', result: result.value, timestamp: Date.now() }
  history.value.unshift(item)
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('json-schema-history', JSON.stringify(history.value))
}
function loadFromHistory(item: HistoryItem) {
  result.value = item.result
  error.value = ''
  processingTime.value = null
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('json-schema-history', JSON.stringify(history.value))
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function validate(schema: any, data: any, path = '$'): string[] {
  const errs: string[] = []
  const t = schema.type
  if (t) {
    const ok =
      (t === 'object' && typeof data === 'object' && data !== null && !Array.isArray(data)) ||
      (t === 'array' && Array.isArray(data)) ||
      (t === 'string' && typeof data === 'string') ||
      (t === 'number' && typeof data === 'number') ||
      (t === 'integer' && Number.isInteger(data)) ||
      (t === 'boolean' && typeof data === 'boolean') ||
      (t === 'null' && data === null)
    if (!ok) errs.push(`${path}: type 期望 ${t}`)
  }
  if (schema.enum && Array.isArray(schema.enum)) {
    if (!schema.enum.some((v: any) => JSON.stringify(v) === JSON.stringify(data))) errs.push(`${path}: 不在 enum 列表中`)
  }
  if (schema.const !== undefined) {
    if (JSON.stringify(schema.const) !== JSON.stringify(data)) errs.push(`${path}: 不等于 const 指定值`)
  }
  if (schema.type === 'object') {
    const props = schema.properties || {}
    const required: string[] = schema.required || []
    for (const key of required) {
      if (!(key in (data || {}))) errs.push(`${path}: 缺少必需属性 '${key}'`)
    }
    for (const key of Object.keys(props)) {
      if (key in (data || {})) errs.push(...validate(props[key], data[key], `${path}.${key}`))
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(data || {})) {
        if (!props[key]) errs.push(`${path}: 额外属性 '${key}' 不允许`)
      }
    }
  }
  if (schema.type === 'array') {
    if (Array.isArray(data)) {
      const items = schema.items
      if (items) data.forEach((v, i) => errs.push(...validate(items, v, `${path}[${i}]`)))
      if (schema.minItems != null && data.length < schema.minItems) errs.push(`${path}: 长度小于 minItems`)
      if (schema.maxItems != null && data.length > schema.maxItems) errs.push(`${path}: 长度大于 maxItems`)
      if (schema.uniqueItems) {
        const set = new Set(data.map((x) => JSON.stringify(x)))
        if (set.size !== data.length) errs.push(`${path}: uniqueItems 违反`)
      }
    }
  }
  if (schema.type === 'string') {
    if (typeof data === 'string') {
      if (schema.minLength != null && data.length < schema.minLength) errs.push(`${path}: 长度小于 minLength`)
      if (schema.maxLength != null && data.length > schema.maxLength) errs.push(`${path}: 长度大于 maxLength`)
      if (schema.pattern) {
        try {
          const re = new RegExp(schema.pattern)
          if (!re.test(data)) errs.push(`${path}: 不匹配 pattern`)
        } catch {}
      }
      if (schema.format) {
        if (schema.format === 'email') {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!re.test(data)) errs.push(`${path}: 非 email 格式`)
        }
        if (schema.format === 'uri') {
          try {
            new URL(data)
          } catch {
            errs.push(`${path}: 非 uri 格式`)
          }
        }
        if (schema.format === 'date-time') {
          const d = new Date(data)
          if (Number.isNaN(d.getTime())) errs.push(`${path}: 非 date-time 格式`)
        }
      }
    }
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    if (typeof data === 'number') {
      if (schema.minimum != null && data < schema.minimum) errs.push(`${path}: 小于 minimum`)
      if (schema.maximum != null && data > schema.maximum) errs.push(`${path}: 大于 maximum`)
      if (schema.exclusiveMinimum != null && data <= schema.exclusiveMinimum) errs.push(`${path}: 小于等于 exclusiveMinimum`)
      if (schema.exclusiveMaximum != null && data >= schema.exclusiveMaximum) errs.push(`${path}: 大于等于 exclusiveMaximum`)
      if (schema.multipleOf != null && data % schema.multipleOf !== 0) errs.push(`${path}: 非 multipleOf`)
    }
  }
  return errs
}

function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const start = performance.now()
  try {
    const schema = JSON.parse(schemaText.value)
    const lines = dataText.value.split(/\r?\n/).filter((l) => l.trim().length > 0)
    const items = lines.map((line) => {
      try {
        const data = JSON.parse(line)
        const errors = validate(schema, data, '$')
        return { ok: errors.length === 0, errors, data }
      } catch (e: any) {
        return { ok: false, errors: ['JSON 解析失败: ' + (e?.message || String(e))], data: null }
      }
    })
    result.value = JSON.stringify({ items }, null, 2)
    processingTime.value = Math.round(performance.now() - start)
  } catch (e: any) {
    error.value = e?.message || '校验失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('json-schema-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
