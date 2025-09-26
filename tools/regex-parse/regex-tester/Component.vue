<template>
  <div class="space-y-2">
    <input v-model="pattern" placeholder="/(\\w+)/g" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" />
    <textarea v-model="text" rows="3" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" />
    <div class="rounded-lg bg-black/10 p-2 text-xs ring-1 ring-white/5">
      <span v-for="(seg, i) in highlighted" :key="i" :class="seg.m ? 'bg-theme-primary/40 rounded px-1' : ''">{{ seg.s }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
const pattern = ref(String.raw`(\w+)`)
const flags = ref('g')
const text = ref('hello 123 world')
const highlighted = computed(() => {
  try {
    const re = new RegExp(pattern.value, flags.value)
    const parts: { s: string; m: boolean }[] = []
    let lastIndex = 0
    let m
    while ((m = re.exec(text.value)) !== null) {
      const start = m.index
      const end = re.lastIndex
      if (start > lastIndex) parts.push({ s: text.value.slice(lastIndex, start), m: false })
      parts.push({ s: text.value.slice(start, end), m: true })
      lastIndex = end
      if (!re.global) break
    }
    if (lastIndex < text.value.length) parts.push({ s: text.value.slice(lastIndex), m: false })
    return parts
  } catch {
    return [{ s: text.value, m: false }]
  }
})
</script>
