<template>
  <div class="space-y-2 text-center">
    <div class="text-2xl font-bold">{{ mm }}:{{ ss }}</div>
    <div class="flex justify-center gap-2">
      <button class="rounded bg-theme-primary/60 px-3 py-1 text-xs" @click="start">Start</button>
      <button class="rounded bg-white/10 px-3 py-1 text-xs" @click="pause">Pause</button>
      <button class="rounded bg-white/10 px-3 py-1 text-xs" @click="reset">Reset</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
const total = ref(25 * 60) // seconds
const left = ref(total.value)
let t: any
const mm = computed(() => String(Math.floor(left.value / 60)).padStart(2, '0'))
const ss = computed(() => String(left.value % 60).padStart(2, '0'))
function tick() {
  if (left.value > 0) left.value--
  else pause()
}
function start() {
  if (t) return
  t = setInterval(tick, 1000)
}
function pause() {
  if (t) {
    clearInterval(t)
    t = null
  }
}
function reset() {
  pause()
  left.value = total.value
}
</script>
