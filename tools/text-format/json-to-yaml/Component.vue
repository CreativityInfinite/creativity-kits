<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">JSON 输入</label>
        <textarea
          v-model="jsonInput"
          @input="convertToYaml"
          rows="12"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
          placeholder="请输入 JSON 格式数据..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">YAML 输出</label>
        <textarea
          v-model="yamlOutput"
          readonly
          rows="12"
          class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          placeholder="转换后的 YAML 将显示在这里..."
        />
      </div>
    </div>

    <div class="flex justify-center gap-4">
      <button @click="convertToYaml" :disabled="!jsonInput.trim()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">转换为 YAML</button>
      <button @click="copyResult" :disabled="!yamlOutput || isError" class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">复制结果</button>
      <button @click="clearAll" class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const jsonInput = ref(`{
  "name": "张三",
  "age": 25,
  "city": "北京",
  "hobbies": ["读书", "旅行", "编程"]
}`)

const yamlOutput = ref('')
const isError = ref(false)

function convertToYaml() {
  if (!jsonInput.value.trim()) {
    yamlOutput.value = ''
    isError.value = false
    return
  }

  try {
    const obj = JSON.parse(jsonInput.value)
    yamlOutput.value = convertObjectToYaml(obj)
    isError.value = false
  } catch (error) {
    yamlOutput.value = `转换失败: ${error instanceof Error ? error.message : '未知错误'}`
    isError.value = true
  }
}

function convertObjectToYaml(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent)

  if (obj === null) return 'null'
  if (typeof obj === 'boolean') return obj.toString()
  if (typeof obj === 'number') return obj.toString()
  if (typeof obj === 'string') return obj

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map((item) => `${spaces}- ${convertObjectToYaml(item, indent + 1)}`).join('\n')
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
    if (entries.length === 0) return '{}'

    return entries
      .map(([key, value]) => {
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          return `${spaces}${key}:\n${convertObjectToYaml(value, indent + 1)}`
        } else {
          return `${spaces}${key}: ${convertObjectToYaml(value, indent)}`
        }
      })
      .join('\n')
  }

  return String(obj)
}

function clearAll() {
  jsonInput.value = ''
  yamlOutput.value = ''
  isError.value = false
}

async function copyResult() {
  if (!yamlOutput.value || isError.value) return

  try {
    await navigator.clipboard.writeText(yamlOutput.value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

convertToYaml()
</script>
