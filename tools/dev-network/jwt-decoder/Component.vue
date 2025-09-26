<template>
  <div class="space-y-2">
    <textarea v-model="token" rows="3" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" placeholder="eyJhbGciOi..." />
    <div class="rounded-lg bg-black/10 p-2 text-xs ring-1 ring-white/5 whitespace-pre-wrap break-all">{{ pretty }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
const token = ref('')
const pretty = computed(() => {
  try {
    const parts = token.value.split('.')
    if (parts.length < 2) return 'Invalid JWT'
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))))
    return JSON.stringify(payload, null, 2)
  } catch {
    return 'Invalid JWT'
  }
})
</script>
