<template>
  <NuxtLink
    :to="disabled ? '' : `/t/${tool.id}`"
    class="group relative overflow-hidden rounded-2xl bg-white text-gray-900 ring-1 ring-black/10 transition-transform transition-opacity duration-300 dark:bg-bg-card dark:text-white dark:ring-white/10 p-4 will-change-transform block cursor-pointer"
    :class="[
      active ? 'translate-y-[-4px] scale-[1.01] shadow-glow' : 'translate-y-[4px] opacity-60 blur-[1px]',
      disabled ? 'pointer-events-none select-none cursor-default' : 'hover:shadow-glow hover:ring-blue-300 dark:hover:ring-blue-600'
    ]"
    :aria-disabled="disabled ? 'true' : 'false'"
    :data-active="active ? 'true' : 'false'"
    :data-disabled="disabled ? 'true' : 'false'"
    :inert="disabled ? true : undefined"
  >
    <div class="mb-3 flex items-start justify-between gap-3">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <div class="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-sm" :style="{ background: displayBg }">
          <Icon :icon="displayIcon" class="h-5 w-5 text-white/90 dark:text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold leading-tight text-gray-900 dark:text-white mb-1 truncate">
            {{ $t(tool.i18nKey + '.name', tool.name) }}
          </h3>
          <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed overflow-hidden" style="-webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical">
            {{ $t(tool.i18nKey + '.desc', tool.description) }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-2 flex flex-wrap gap-1">
      <span
        v-for="tag in tool.tags || []"
        :key="tag"
        class="rounded-md bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-white/10 font-medium"
      >
        #{{ tag }}
      </span>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <div class="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ring-1 ring-blue-200 text-blue-700 bg-blue-50 dark:ring-blue-900/40 dark:text-blue-200 dark:bg-blue-900/20">
        {{ $t(`categories.${tool.category}`, tool.category) }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import type { ToolMetaRuntime } from '~/types/tool'
// 接收 props 以便在脚本中安全访问
const { tool, active, disabled } = defineProps<{ tool: ToolMetaRuntime; active?: boolean; disabled?: boolean }>()
// 分类 → 默认图标
const categoryIconMap: Record<string, string> = {
  'text-format': 'mdi:code-braces',
  'regex-parse': 'tabler:regex',
  'time-date': 'mdi:calendar-clock',
  'color-graphics': 'mdi:palette',
  'image-media': 'mdi:image',
  'dev-network': 'tabler:cloud-network',
  'data-file': 'mdi:file-search',
  'security-privacy': 'tabler:shield-lock',
  'math-unit': 'mdi:calculator-variant',
  productivity: 'mdi:view-column',
  'social-marketing': 'mdi:camera',
  'education-language': 'mdi:translate',
  'map-geo': 'mdi:map-marker-path',
  'system-browser': 'mdi:application-cog'
}
// 分类 → 默认色带（渐变）
const categoryColorMap: Record<string, string> = {
  'text-format': 'linear-gradient(135deg,#10b981,#06b6d4)',
  'regex-parse': 'linear-gradient(135deg,#f97316,#f59e0b)',
  'time-date': 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'color-graphics': 'linear-gradient(135deg,#a855f7,#22d3ee)',
  'image-media': 'linear-gradient(135deg,#ef4444,#f97316)',
  'dev-network': 'linear-gradient(135deg,#0ea5e9,#22c55e)',
  'data-file': 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'security-privacy': 'linear-gradient(135deg,#f43f5e,#ef4444)',
  'math-unit': 'linear-gradient(135deg,#22c55e,#84cc16)',
  productivity: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'social-marketing': 'linear-gradient(135deg,#f59e0b,#ef4444)',
  'education-language': 'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'map-geo': 'linear-gradient(135deg,#22d3ee,#06b6d4)',
  'system-browser': 'linear-gradient(135deg,#64748b,#0ea5e9)'
}
const defaultGradient = 'linear-gradient(135deg,#7c3aed,#22d3ee)'
const displayIcon = computed(() => tool.icon || categoryIconMap[tool.category] || 'tabler:apps')
const displayBg = computed(() => tool.color || categoryColorMap[tool.category] || defaultGradient)
</script>
