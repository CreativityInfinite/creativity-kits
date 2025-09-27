<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">标签生成器</h1>
      <p class="text-gray-600 dark:text-gray-400">基于文本快速生成社交媒体话题标签（#hashtag），可自定义最大数量与最小长度。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">输入文本</label>
        <textarea v-model="text" rows="6" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="输入描述/正文..." />
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">最大标签数</label>
          <input v-model.number="maxCount" type="number" min="1" max="50" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">最小长度</label>
          <input v-model.number="minLen" type="number" min="2" max="20" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="generate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">生成标签</button>
      <button v-if="tags.length" @click="copy" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">复制</button>
    </div>

    <div v-if="tags.length" class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
      <div class="flex flex-wrap gap-2">
        <span v-for="t in tags" :key="t" class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded text-sm border border-blue-200 dark:border-blue-800">#{{ t }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
const maxCount = ref(15)
const minLen = ref(3)
const tags = ref<string[]>([])

function generate() {
  const t = (text.value || '').toLowerCase()
  const words = t
    .replace(/[^\p{L}\p{N}\s_-]+/gu, ' ')
    .split(/[\s_-]+/g)
    .map((w) => w.trim())
    .filter((w) => w && w.length >= (minLen.value || 3))

  const stop = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'are',
    'you',
    'your',
    'a',
    'an',
    'to',
    'in',
    'on',
    'of',
    'or',
    'as',
    'at',
    'is',
    'be',
    'by',
    'it',
    'we',
    'our',
    'they',
    'them',
    'i'
  ])
  const freq = new Map<string, number>()
  for (const w of words) {
    if (stop.has(w)) continue
    freq.set(w, (freq.get(w) || 0) + 1)
  }
  tags.value = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, Math.min(50, maxCount.value || 15)))
    .map(([w]) => w)
}

async function copy() {
  if (!tags.value.length) return
  try {
    await navigator.clipboard.writeText(tags.value.map((w) => `#${w}`).join(' '))
    alert('已复制')
  } catch {
    alert('复制失败，请手动复制')
  }
}
</script>
