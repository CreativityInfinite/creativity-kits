<template>
  <div class="space-y-2">
    <div class="grid grid-cols-2 gap-2 text-xs">
      <input v-model.number="a.lat" type="number" placeholder="lat1" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <input v-model.number="a.lon" type="number" placeholder="lon1" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <input v-model.number="b.lat" type="number" placeholder="lat2" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
      <input v-model.number="b.lon" type="number" placeholder="lon2" class="rounded bg-black/20 p-1 ring-1 ring-white/10" />
    </div>
    <div class="rounded bg-black/10 p-2 text-sm ring-1 ring-white/5">距离: {{ (dist / 1000).toFixed(3) }} km</div>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive } from 'vue'
import { haversine } from '~/utils/haversine'
const a = reactive({ lat: 39.9, lon: 116.4 })
const b = reactive({ lat: 31.2, lon: 121.5 })
const dist = computed(() => haversine(a.lat, a.lon, b.lat, b.lon))
</script>
