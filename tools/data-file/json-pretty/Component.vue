<template>
  <div class="space-y-2">
    <textarea v-model="raw" rows="4" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" placeholder='{"a":1}' />
    <div class="flex gap-2">
      <button class="rounded bg-theme-primary/60 px-3 py-1 text-xs" @click="format">Format</button>
      <button class="rounded bg-white/10 px-3 py-1 text-xs" @click="clear">Clear</button>
    </div>
    <pre class="rounded-lg bg-black/10 p-2 text-xs ring-1 ring-white/5 whitespace-pre-wrap break-all">{{ pretty }}</pre>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const raw = ref('')
const pretty = ref('')
function format() {
  try {
    pretty.value = JSON.stringify(JSON.parse(raw.value), null, 2)
  } catch {
    pretty.value = 'Invalid JSON'
  }
}
function clear() {
  raw.value = ''
  pretty.value = ''
}
</script>
