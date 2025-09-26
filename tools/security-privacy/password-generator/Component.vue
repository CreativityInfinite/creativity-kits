<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <label>Len</label><input type="number" v-model.number="len" class="w-16 rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <label><input type="checkbox" v-model="upper" class="mr-1" />A-Z</label>
      <label><input type="checkbox" v-model="lower" class="mr-1" />a-z</label>
      <label><input type="checkbox" v-model="digit" class="mr-1" />0-9</label>
      <label><input type="checkbox" v-model="symbol" class="mr-1" />!@#</label>
    </div>
    <div class="rounded-lg bg-black/10 p-2 text-sm ring-1 ring-white/5 font-mono break-all">{{ pass }}</div>
    <button class="rounded bg-theme-primary/60 px-3 py-1 text-xs" @click="gen">Generate</button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const len = ref(16)
const upper = ref(true)
const lower = ref(true)
const digit = ref(true)
const symbol = ref(false)
const pass = ref('')
function gen() {
  let pool = ''
  if (upper.value) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lower.value) pool += 'abcdefghijklmnopqrstuvwxyz'
  if (digit.value) pool += '0123456789'
  if (symbol.value) pool += '!@#$%^&*()_+-=[]{};:,.?/|'
  if (!pool) {
    pass.value = ''
    return
  }
  let out = ''
  for (let i = 0; i < len.value; i++) out += pool[Math.floor(Math.random() * pool.length)]
  pass.value = out
}
gen()
</script>
