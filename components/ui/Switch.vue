<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
    :class="modelValue ? 'bg-sky-500/80 dark:bg-sky-400/70' : 'bg-gray-300 dark:bg-white/15'"
    @click="toggle"
  >
    <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-1 ring-black/5 transition-transform dark:bg-gray-100" :class="modelValue ? 'translate-x-5' : 'translate-x-1'" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();
function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>
