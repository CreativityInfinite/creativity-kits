<template>
  <div class="relative">
    <!-- Fullscreen techy background layers -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div class="neon-grid absolute inset-0"></div>
      <div class="stars absolute inset-0"></div>
      <div class="rotating-ring absolute -top-10 right-0 h-40 w-40"></div>
      <div class="neon-sweep absolute inset-y-0 -left-1/3 w-1/3"></div>
      <div class="absolute -top-24 -left-20 h-64 w-64 rounded-full blur-3xl bg-gradient-to-tr from-fuchsia-500/30 via-sky-400/20 to-emerald-400/30 animate-float-slow"></div>
      <div
        class="absolute -bottom-24 -right-20 h-72 w-72 rounded-full blur-3xl bg-gradient-to-tr from-emerald-400/25 via-sky-400/15 to-fuchsia-500/25 animate-float-slow"
        style="animation-delay: 9s"
      ></div>
    </div>

    <main id="top" class="mx-auto relative max-w-7xl px-4 pb-16 pt-20 md:pt-24 lg:pt-28">
      <header class="mb-6 md:mb-8 lg:mb-10">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Creativity Kits
            <span class="animation-hello ml-1 inline-block align-baseline" aria-hidden="true"> 👋 </span>
          </h1>
        </div>
        <p class="mt-3 text-base leading-relaxed text-gray-700 dark:text-gray-400 md:text-lg">
          {{ t('home.subtitle') }}
        </p>
        <div class="shimmer-line mt-3 h-[2px] w-28 rounded-full" aria-hidden="true"></div>
      </header>

      <div ref="sentinel" class="h-1 -mt-1" aria-hidden="true"></div>

      <div class="-mx-4 mb-6 px-4 pt-4 pb-2 sticky top-0 z-30 transition-all duration-500 ease-out">
        <!-- 吸顶时才展示顶部渐变遮罩 -->
        <div class="relative rounded-xl">
          <transition name="tabmask">
            <div v-if="tabsSticky" class="pointer-events-none absolute inset-0 -mx-4 px-4" aria-hidden="true">
              <div class="h-12 -mt-2 w-full bg-gradient-to-b from-white/95 via-white/85 to-white/20 dark:from-bg/95 dark:via-bg/85 dark:to-bg/20 backdrop-blur-sm"></div>
            </div>
          </transition>
          <Tabs :tabs="tabs" :active="activeTab" :center="tabsSticky" class="" @change="onTabChange" />
        </div>
      </div>

      <!-- Cards zone with techy decorative layers -->
      <div class="relative">
        <!-- 使用 TransitionGroup 直接作为网格容器，启用 FLIP 过渡 -->
        <TransitionGroup name="grid" tag="div" class="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" appear>
          <ToolCard v-for="tool in sortedTools" :key="tool.id" :tool="tool" :active="isMatch(tool)" :disabled="!isMatch(tool)" class="duration-500 ease-out" />
        </TransitionGroup>
      </div>
    </main>
  </div>

  <BackToTop />
</template>

<script setup lang="ts">
import Tabs from '~/components/Tabs.vue'
import ToolCard from '~/components/ToolCard.vue'
import ThemeStyleSwitch from '~/components/ThemeStyleSwitch.vue'
import ColorModeSwitch from '~/components/ColorModeSwitch.vue'
import LangSwitch from '~/components/LangSwitch.vue'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import BackToTop from '~/components/BackToTop.vue'
import { useTools } from '~/composables/useTools'
import { isMatchFactory, sortByMatch } from '~/composables/useToolFilters'
import type { ToolMetaRuntime } from '~/types/tool'
import { useState } from 'nuxt/app'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 直接顶层获取，避免 Ref 嵌套导致 tool 为 true/false/undefined
const { tools, categories, popularTag } = await useTools()

const tabs = computed(() => [
  { id: 'all', label: t('tabs.all') },
  { id: 'hot', label: t('tabs.hot') },
  { id: 'new', label: t('tabs.new') },
  ...categories.value.map((c: string) => ({ id: c, label: t(`categories.${c}`, c) }))
])

const activeTab = ref('all')

const sentinel = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
// 用于与 app.vue 顶部开关联动隐藏：Tabs 一旦吸顶则隐藏右上角开关
const headerSwitchesHidden = useState('headerSwitchesHidden', () => false)
const tabsSticky = computed(() => headerSwitchesHidden.value)

onMounted(() => {
  if (!sentinel.value) return
  io = new IntersectionObserver(
    (entries) => {
      const e = entries[0]
      // 当 sentinel 不可见 => Tabs 已吸顶（卡在顶部），隐藏右上角
      headerSwitchesHidden.value = !e.isIntersecting
    },
    { root: null, threshold: 0 }
  )
  io.observe(sentinel.value)
})
onBeforeUnmount(() => {
  if (io && sentinel.value) io.unobserve(sentinel.value)
  io = null
  // 页面离开时恢复显示
  headerSwitchesHidden.value = false
})

const isMatch = isMatchFactory(activeTab, popularTag)
const sortedTools = computed(() => {
  const list = tools.value || []
  return [...list].sort(sortByMatch(isMatch as (t: ToolMetaRuntime) => boolean))
})

function onTabChange(id: string) {
  activeTab.value = id
}
</script>

<style scoped>
.grid-enter-active,
.grid-leave-active {
  transition:
    opacity 420ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.grid-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
.grid-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.grid-leave-from {
  opacity: 1;
  transform: scale(1);
}
.grid-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
/* 列表重排时启用移动过渡 */
.grid-move {
  transition: transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
/* 保留仅与卡片网格重排相关的过渡样式，其他全局装饰动效已迁移至 assets/css/animations.css */
/* Tabs 吸顶遮罩的淡入淡出 - 更长更明显的过渡 */
.tabmask-enter-active,
.tabmask-leave-active {
  transition:
    opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.tabmask-enter-from,
.tabmask-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.tabmask-enter-to,
.tabmask-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
