<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <button class="rounded bg-theme-primary/60 px-3 py-1 text-xs" @click="read">读取剪贴板</button>
      <button class="rounded bg-white/10 px-3 py-1 text-xs" @click="clear">清空历史</button>
    </div>
    <ul class="space-y-1 text-xs">
      <li v-for="(item, i) in history" :key="i" class="flex items-center justify-between rounded bg-black/10 p-2 ring-1 ring-white/5">
        <span class="mr-2 line-clamp-1">{{ item }}</span>
        <button class="rounded bg-white/10 px-2 py-1" @click="copy(item)">复制</button>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const history = ref<string[]>([])
onMounted(() => {
  const raw = localStorage.getItem('clip-history')
  if (raw) history.value = JSON.parse(raw)
})
function persist() {
  localStorage.setItem('clip-history', JSON.stringify(history.value.slice(0, 20)))
}
async function read() {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      history.value.unshift(text)
      persist()
    }
  } catch {
    /* 权限可能被拒绝 */
  }
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {}
}
function clear() {
  history.value = []
  persist()
}
</script>
