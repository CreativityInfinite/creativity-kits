<template>
  <div class="space-y-2">
    <input v-model="base" placeholder="https://example.com" class="w-full rounded bg-black/20 p-2 text-sm ring-1 ring-white/10" />
    <div class="grid grid-cols-2 gap-2 text-xs">
      <input v-model="source" placeholder="source" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <input v-model="medium" placeholder="medium" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <input v-model="campaign" placeholder="campaign" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <input v-model="content" placeholder="content" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
    </div>
    <div class="rounded bg-black/10 p-2 text-xs ring-1 ring-white/5 break-all">{{ url }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
const base = ref('https://example.com')
const source = ref('newsletter')
const medium = ref('email')
const campaign = ref('launch')
const content = ref('')
const url = computed(() => {
  const u = new URL(base.value)
  if (source.value) u.searchParams.set('utm_source', source.value)
  if (medium.value) u.searchParams.set('utm_medium', medium.value)
  if (campaign.value) u.searchParams.set('utm_campaign', campaign.value)
  if (content.value) u.searchParams.set('utm_content', content.value)
  return u.toString()
})
</script>
