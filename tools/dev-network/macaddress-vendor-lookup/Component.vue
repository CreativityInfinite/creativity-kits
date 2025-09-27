<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">MAC 地址厂商查询</h1>
      <p class="text-gray-600 dark:text-gray-400">输入 MAC（形如 44:38:39:ff:ef:57 或 443839ffee57），先本地 OUI 命中，未命中再尝试远程。</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输入 </label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入内容..."
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">处理</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输出 </label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            placeholder="处理结果将显示在这里..."
          />
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">复制结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const output = ref('')

async function process() {
  const raw = input.value.trim()
  if (!raw) {
    output.value = ''
    return
  }
  const mac = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
  if (mac.length !== 12) {
    output.value = '格式错误：请提供 12 个十六进制字符的 MAC（可带 : 或 - 分隔）。'
    return
  }
  const oui = mac.slice(0, 6)
  const localMap: Record<string, string> = {
    // 常见示例（可按需扩充）
    '000C29': 'VMware, Inc.',
    '00163E': 'Apple, Inc.',
    F4F5E8: 'HUAWEI TECHNOLOGIES CO.,LTD',
    F0D5BF: 'Hangzhou Hikvision Digital Technology Co.,Ltd.',
    '44D9E7': 'Xiaomi Communications Co Ltd',
    D85D4C: 'Hon Hai Precision Ind. Co.,Ltd. (Foxconn)'
  }
  if (localMap[oui]) {
    output.value = `本地命中：${localMap[oui]}`
    return
  }
  output.value = '查询远程数据库中...'
  try {
    // macvendors.com 返回纯文本厂商名
    const res = await fetch(`https://api.macvendors.com/${mac}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const vendor = await res.text()
    output.value = vendor || '未查询到厂商信息'
  } catch (e: any) {
    output.value = `查询失败：${e?.message || e}\n提示：可扩充本地 OUI 字典，或改用其他公共服务。`
  }
}

async function copyToClipboard() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请重试')
  }
}
</script>
