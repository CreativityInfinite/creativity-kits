<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        房贷计算器
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        房贷计算器工具，功能待实现
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输入
          </label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入内容..."
          />
        </div>

        <div class="flex justify-center">
          <button
            @click="process"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            处理
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输出
          </label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            placeholder="处理结果将显示在这里..."
          />
        </div>

        <div class="flex justify-center">
          <button
            @click="copyToClipboard"
            :disabled="!output"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            复制结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const output = ref('')

function process() {
  // TODO: 实现具体的处理逻辑
  output.value = `处理结果: ${input.value}`
}

async function copyToClipboard() {
  if (!output.value) return
  
  try {
    await navigator.clipboard.writeText(output.value)
    // TODO: 添加成功提示
  } catch (err) {
    console.error('复制失败:', err)
    // TODO: 添加错误提示
  }
}
</script>
