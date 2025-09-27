<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">社交媒体发布计划器</h1>
      <p class="text-gray-600 dark:text-gray-400">创建计划条目（内容、时间、平台），保存在本地并可导出 JSON。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">内容</label>
        <textarea v-model="content" rows="4" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="要发布的内容"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">发布时间</label>
        <input v-model="when" type="datetime-local" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="md:col-span-3">
        <label class="block text-sm font-medium mb-2">平台</label>
        <div class="flex flex-wrap gap-3">
          <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="platforms" value="X/Twitter" /> X/Twitter</label>
          <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="platforms" value="Facebook" /> Facebook</label>
          <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="platforms" value="LinkedIn" /> LinkedIn</label>
          <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="platforms" value="Instagram" /> Instagram</label>
          <label class="inline-flex items-center gap-2"><input type="checkbox" v-model="platforms" value="Weibo" /> Weibo</label>
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="add" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">添加计划</button>
      <button v-if="items.length" @click="copyJson" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">复制 JSON</button>
      <button v-if="items.length" @click="clearAll" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">清空</button>
    </div>

    <div v-if="items.length" class="space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ items.length }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">计划条目</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ upcoming }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">未到时间</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ distinctPlatforms }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">覆盖平台</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ todayCount }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">今日计划</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600 dark:text-gray-400">
              <th class="py-2 px-3">时间</th>
              <th class="py-2 px-3">平台</th>
              <th class="py-2 px-3">内容</th>
              <th class="py-2 px-3">操作</th>
            </tr>
          </thead>
          <tbody class="text-gray-800 dark:text-gray-200">
            <tr v-for="(it, i) in items" :key="it.id">
              <td class="py-2 px-3">{{ new Date(it.when).toLocaleString() }}</td>
              <td class="py-2 px-3">{{ it.platforms.join(', ') }}</td>
              <td class="py-2 px-3 max-w-[480px] truncate" :title="it.content">{{ it.content }}</td>
              <td class="py-2 px-3">
                <button @click="remove(i)" class="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded border border-red-200 dark:border-red-800">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type Item = { id: string; content: string; when: string; platforms: string[] }

const content = ref('')
const when = ref('')
const platforms = ref<string[]>([])
const items = ref<Item[]>([])

function add() {
  const c = content.value.trim()
  if (!c || !when.value || platforms.value.length === 0) return
  items.value.push({ id: crypto.randomUUID(), content: c, when: new Date(when.value).toISOString(), platforms: [...platforms.value] })
  content.value = ''
  when.value = ''
  platforms.value = []
  save()
}

function remove(i: number) {
  items.value.splice(i, 1)
  save()
}

function save() {
  localStorage.setItem('social-post-scheduler', JSON.stringify(items.value))
}

function load() {
  const raw = localStorage.getItem('social-post-scheduler')
  if (!raw) return
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) items.value = arr
  } catch {}
}

const upcoming = computed(() => items.value.filter((i) => new Date(i.when).getTime() > Date.now()).length)
const distinctPlatforms = computed(() => new Set(items.value.flatMap((i) => i.platforms)).size)
const todayCount = computed(() => {
  const d = new Date()
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate()
  return items.value.filter((i) => {
    const t = new Date(i.when)
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === day
  }).length
})

async function copyJson() {
  const json = JSON.stringify(items.value, null, 2)
  try {
    await navigator.clipboard.writeText(json)
    alert('已复制 JSON')
  } catch {
    alert('复制失败，请手动复制')
  }
}

function clearAll() {
  if (!items.value.length) return
  if (!confirm('确定清空所有计划？')) return
  items.value = []
  save()
}

onMounted(load)
</script>