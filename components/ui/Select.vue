<template>
  <div class="relative inline-block text-left" ref="root">
    <button
      type="button"
      class="inline-flex min-w-[160px] items-center justify-between rounded-md border border-gray-200 bg-white/80 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 dark:border-white/10 dark:bg-bg-card/80 dark:text-gray-200"
      @click.stop="open = !open"
      :aria-expanded="open ? 'true' : 'false'"
    >
      <span>{{ selectedLabel }}</span>
      <svg class="ml-2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-30 mt-2 w-48 origin-top-right rounded-md border border-gray-200 bg-white/95 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-bg-card/95 dark:text-gray-100"
      @click.stop
    >
      <button
        v-for="opt in options"
        :key="String(opt.value)"
        class="w-full select-none rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-white/10 dark:focus:bg-white/10"
        @click="choose(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

interface Option {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const selectedLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label ?? '')

function onClickAway(e: MouseEvent) {
  const target = e.target as Node | null
  const el = root.value
  if (!el || !target) return
  if (!el.contains(target)) {
    open.value = false
  }
}

function choose(v: string) {
  emit('update:modelValue', v)
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickAway)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickAway)
})
</script>
