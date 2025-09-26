<template>
  <div
    class="group relative overflow-hidden rounded-2xl bg-white text-gray-900 ring-1 ring-black/10 transition-transform transition-opacity duration-300 dark:bg-bg-card dark:text-white dark:ring-white/10 p-4 will-change-transform"
    :class="[active ? 'translate-y-[-4px] scale-[1.01] shadow-glow' : 'translate-y-[4px] opacity-60 blur-[1px]', disabled ? 'pointer-events-none select-none cursor-default' : 'hover:shadow-glow']"
    :aria-disabled="disabled ? 'true' : 'false'"
    :data-active="active ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : 'false'"
    :inert="disabled ? true : undefined"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <div class="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-sm" :style="{ background: tool.color || 'linear-gradient(135deg,#7c3aed,#22d3ee)' }">
          <Icon :icon="tool.icon || 'tabler:apps'" class="h-5 w-5 text-white/90 dark:text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold leading-tight text-gray-900 dark:text-white mb-1">
            {{ $t(tool.i18nKey + '.name', tool.name) }}
          </h3>
          <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ $t(tool.i18nKey + '.desc', tool.description) }}
          </p>
        </div>
      </div>
      <div class="text-[10px] text-gray-600 dark:text-gray-400 font-medium bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md whitespace-nowrap">
        {{ $t(`categories.${tool.category}`, tool.category) }}
      </div>
    </div>

    <div class="relative z-10">
      <client-only>
        <Suspense>
          <component :is="tool.component" class="block rounded-xl bg-black/10 p-3 text-base ring-1 ring-white/5" />
          <template #fallback>
            <div class="h-28 animate-pulse rounded-xl bg-white/5"></div>
          </template>
        </Suspense>
      </client-only>
    </div>
    <div class="mt-2 flex items-center justify-end">
      <NuxtLink
        :to="disabled ? '' : `/t/${tool.id}`"
        class="rounded-md bg-theme-primary/60 px-3 py-1.5 text-xs font-medium hover:bg-theme-primary/70 aria-disabled:opacity-50 transition-colors text-white"
        :aria-disabled="disabled ? 'true' : 'false'"
        :tabindex="disabled ? -1 : 0"
        @click.prevent="disabled && true"
      >
        {{ $t('common.open', '打开') }}
      </NuxtLink>
    </div>

    <div class="mt-2 flex flex-wrap gap-1">
      <span
        v-for="tag in tool.tags || []"
        :key="tag"
        class="rounded-md bg-gray-100 dark:bg-white/5 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-white/10 font-medium"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { ToolMetaRuntime } from '~/types/tool'
defineProps<{ tool: ToolMetaRuntime; active?: boolean; disabled?: boolean }>()
</script>
