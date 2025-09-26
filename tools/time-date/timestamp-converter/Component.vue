<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <input v-model="unix" placeholder="Unix ms" class="w-1/2 rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" />
      <input v-model="iso" placeholder="ISO" class="w-1/2 rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" />
    </div>
    <div class="text-xs text-gray-400">{{ human }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
const unix = ref(String(Date.now()))
const iso = ref(dayjs().toISOString())
watch(unix, (v) => {
  const n = Number(v)
  if (!Number.isNaN(n)) iso.value = new Date(n).toISOString()
})
watch(iso, (v) => {
  const t = Date.parse(v)
  if (!Number.isNaN(t)) unix.value = String(t)
})
const human = computed(() => dayjs(iso.value).format('YYYY-MM-DD HH:mm:ss'))
</script>
