<template>
  <div class="space-y-2">
    <input type="file" accept="image/*" @change="onFile" />
    <div class="flex items-center gap-2">
      <label class="text-xs">Width</label>
      <input type="number" v-model.number="width" class="w-24 rounded bg-black/20 p-1 text-xs ring-1 ring-white/10" />
    </div>
    <canvas ref="canvas" class="w-full rounded-lg ring-1 ring-white/10"></canvas>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const img = new Image()
const canvas = ref<HTMLCanvasElement | null>(null)
const width = ref(300)
let original: HTMLImageElement | null = null

function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  img.onload = () => {
    original = img
    draw()
    URL.revokeObjectURL(url)
  }
  img.src = url
}

watch(width, draw)

function draw() {
  if (!canvas.value || !original) return
  const ratio = width.value / original.width
  const h = Math.round(original.height * ratio)
  const ctx = canvas.value.getContext('2d')!
  canvas.value.width = width.value
  canvas.value.height = h
  ctx.drawImage(original, 0, 0, width.value, h)
}
</script>
