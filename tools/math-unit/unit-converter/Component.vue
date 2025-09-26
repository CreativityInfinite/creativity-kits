<template>
  <div class="space-y-2">
    <div class="flex gap-2 text-xs">
      <select v-model="type" class="rounded bg-black/20 p-1 ring-1 ring-white/10">
        <option value="length">Length</option>
        <option value="temp">Temp</option>
      </select>
      <input type="number" v-model.number="val" class="w-24 rounded bg-black/20 p-1 ring-1 ring-white/10" />
    </div>
    <div class="rounded-lg bg-black/10 p-2 text-sm ring-1 ring-white/5">
      <div v-if="type === 'length'">m: {{ val }} | km: {{ (val / 1000).toFixed(3) }} | cm: {{ (val * 100).toFixed(1) }}</div>
      <div v-else>°C: {{ val }} | °F: {{ ((val * 9) / 5 + 32).toFixed(1) }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
const type = ref<'length' | 'temp'>('length')
const val = ref(1)
</script>
