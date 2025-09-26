<template>
  <div class="space-y-2">
    <textarea v-model="input" rows="3" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" :placeholder="$t('tools.base64-encode.desc')" />
    <div class="flex gap-2">
      <button class="rounded bg-theme-primary/60 px-3 py-1 text-xs" @click="encode">{{ t('action.encode') }}</button>
      <button class="rounded bg-white/10 px-3 py-1 text-xs" @click="clear">{{ t('action.clear') }}</button>
    </div>
    <div class="rounded-lg bg-black/10 p-2 text-xs ring-1 ring-white/5 break-all">{{ output }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const { t } = useI18n()
const input = ref('')
const output = ref('')
function encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)))
  } catch (e) {
    output.value = 'Invalid input'
  }
}
function clear() {
  input.value = ''
  output.value = ''
}
</script>
