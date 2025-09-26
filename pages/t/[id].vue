<template>
  <main class="mx-auto max-w-3xl px-4 pb-16 pt-16">
    <NuxtLink to="/" class="text-xs text-gray-500 hover:underline">&larr; {{ t('common.back') }}</NuxtLink>
    <div v-if="tool" class="mt-3 rounded-2xl bg-white text-gray-900 ring-1 ring-black/10 p-4 dark:bg-bg-card dark:text-white dark:ring-white/10">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-9 w-9 rounded-xl" :style="{ background: tool.color || '' }" />
          <div>
            <h1 class="text-lg font-semibold leading-tight">
              {{ $t(tool.i18nKey + '.name', tool.name) }}
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ $t(tool.i18nKey + '.desc', tool.description) }}
            </p>
          </div>
        </div>
        <div class="text-[10px] text-gray-500">{{ tool.category }}</div>
      </div>
      <client-only>
        <Suspense>
          <component :is="tool.component" />
          <template #fallback>
            <div class="h-24 animate-pulse rounded-xl bg-black/5 dark:bg-white/5"></div>
          </template>
        </Suspense>
      </client-only>
    </div>
    <div v-else class="text-sm text-gray-500 dark:text-gray-400">Tool not found.</div>
  </main>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTools } from '~/composables/useTools'
import { useAsyncData } from '#app'
import { useI18n } from 'vue-i18n'
type ToolMetaRuntime = {
  id: string
  name: string
  description?: string
  i18nKey: string
  category: string
  tags?: string[]
  color?: string
  component: any
}

definePageMeta({ ssr: false })

const { t } = useI18n()
const route = useRoute()

/**
 * 避免 Ref 的 Ref：直接返回数组数据，防止 toolsRef.value 变成一个 Ref 对象
 */
const { data: toolsRef } = useAsyncData('tools', async () => {
  const { tools } = await useTools()
  return tools.value
})
const tools = computed(() => (Array.isArray(toolsRef.value) ? toolsRef.value : []))

const tool = computed(() => tools.value.find((x: ToolMetaRuntime) => x.id === String(route.params.id)))
</script>
