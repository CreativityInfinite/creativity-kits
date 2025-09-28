<template>
  <div class="space-y-2">
    <input v-model="hex" placeholder="#7c3aed" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" />
    <div class="rounded-lg bg-black/10 p-2 text-xs ring-1 ring-white/5">RGB: {{ rgb }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
const hex = ref('#7c3aed');
const rgb = computed(() => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.value);
  if (!m) return 'Invalid';
  const r = parseInt(m[1], 16),
    g = parseInt(m[2], 16),
    b = parseInt(m[3], 16);
  return `${r}, ${g}, ${b}`;
});
</script>
