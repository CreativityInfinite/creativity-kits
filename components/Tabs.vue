<template>
  <div class="mb-2 -mt-2 pb-2 pt-2 transition-all duration-500 ease-out" :class="center ? 'transform scale-105' : ''">
    <div class="flex flex-wrap gap-2 transition-all duration-500 ease-out" :class="center ? 'justify-center' : ''">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('change', tab.id)"
        class="rounded-xl px-4 py-2 text-base font-medium ring-1 ring-white/10 transition-all duration-300 ease-out"
        :class="[
          active === tab.id
            ? 'bg-theme-primary/20 text-gray-900 ring-theme-primary/50 dark:text-white'
            : 'bg-black/5 text-gray-700 hover:text-gray-900 dark:bg-bg-soft/60 dark:text-gray-300 dark:hover:text-white',
          center ? 'shadow-lg backdrop-blur-sm' : ''
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ tabs: { id: string; label: string }[]; active: string; center?: boolean }>();
defineEmits<{ change: [id: string] }>();
</script>
