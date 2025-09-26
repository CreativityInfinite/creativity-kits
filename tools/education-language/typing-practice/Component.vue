<template>
  <div class="space-y-2">
    <textarea v-model="text" rows="3" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" placeholder="请输入练习文本" />
    <input v-model="input" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" placeholder="开始输入..." />
    <div class="flex items-center justify-between text-xs text-gray-400">
      <span>速度: {{ wpm }} WPM</span>
      <span>正确率: {{ accuracy }}%</span>
    </div>
    <div class="rounded-lg bg-black/10 p-2 text-sm ring-1 ring-white/5 font-mono whitespace-pre-wrap break-words">
      <span v-for="(ch, i) in text" :key="i" :class="charClass(i)">{{ ch }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
const text = ref('The quick brown fox jumps over the lazy dog.')
const input = ref('')
const startedAt = ref<number | null>(null)
watchEffect(() => {
  if (input.value.length > 0 && !startedAt.value) startedAt.value = Date.now()
})
const wpm = computed(() => {
  if (!startedAt.value) return 0
  const minutes = (Date.now() - startedAt.value) / 60000
  const words = input.value.trim().split(/\s+/).filter(Boolean).length
  return minutes > 0 ? Math.round(words / minutes) : 0
})
const accuracy = computed(() => {
  if (!input.value) return 100
  const len = Math.min(input.value.length, text.value.length)
  let correct = 0
  for (let i = 0; i < len; i++) if (input.value[i] === text.value[i]) correct++
  return Math.round((correct / len) * 100)
})
function charClass(i: number) {
  if (i >= input.value.length) return ''
  return input.value[i] === text.value[i] ? 'text-green-400' : 'text-red-400 underline decoration-red-400/60'
}
</script>
