<template>
  <div class="relative">
    <!-- Fullscreen techy background layers (same as home) -->
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

      <!-- 对角线扫描条 -->
      <div class="absolute -inset-x-1/3 -inset-y-1/3 rotate-12">
        <div class="scanner-stripe"></div>
      </div>
    </div>

    <main class="relative mx-auto max-w-3xl px-4 pb-16 pt-16">
      <!-- 返回按钮：科技感样式 -->
      <NuxtLink
        to="/"
        class="group inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-white/50 px-3 py-1 text-xs font-medium text-sky-700 shadow-sm backdrop-blur transition hover:border-sky-400 hover:bg-white/70 hover:shadow-sky-500/20 dark:bg-white/5 dark:text-sky-300 dark:hover:bg-white/10"
      >
        <span class="relative flex h-5 w-5 items-center justify-center">
          <span class="absolute inset-0 rounded-full bg-sky-500/20 blur-sm transition group-hover:bg-sky-500/30"></span>
          <svg viewBox="0 0 24 24" class="relative h-4 w-4 text-sky-600 dark:text-sky-300 transition group-hover:translate-x-[-1px]">
            <path fill="currentColor" d="M14 7l-5 5 5 5V7z"></path>
          </svg>
        </span>
        <span>{{ t('common.back') }}</span>
      </NuxtLink>

      <div v-if="tool" class="mt-3 rounded-2xl bg-white text-gray-900 ring-1 ring-black/10 p-4 dark:bg-bg-card dark:text-white dark:ring-white/10">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <!-- 圆形徽章（带图标/emoji），对齐首页卡片风格 -->
            <div
              class="group relative grid h-12 w-12 place-items-center rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10 text-white"
              :style="{ background: getDisplayBgUnified((tool as any)?.color, (tool as any)?.category) }"
            >
              <div class="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-sm" :style="{ background: displayBg }">
                <Icon :icon="displayIcon" class="h-5 w-5 text-white/90 dark:text-white" />
              </div>
              <span class="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition group-hover:opacity-100"></span>
            </div>

            <div class="min-w-0">
              <h1 class="truncate text-lg font-semibold leading-tight">
                {{ $t(tool.name) }}
              </h1>
              <p class="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {{ $t(tool.description) }}
              </p>
            </div>
          </div>
          <div class="shrink-0 text-[10px] text-gray-500">{{ $t(`categories.${tool.category}`) }}</div>
        </div>

        <!-- 工具容器：防止内容超宽溢出 -->
        <div class="overflow-x-auto p-4">
          <div class="min-w-0 max-w-full">
            <client-only>
              <Suspense>
                <div class="min-w-0 max-w-full">
                  <component :is="tool.component" />
                </div>
                <template #fallback>
                  <div class="h-24 animate-pulse rounded-xl bg-black/5 dark:bg-white/5"></div>
                </template>
              </Suspense>
            </client-only>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500 dark:text-gray-400">Tool not found.</div>
    </main>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTools } from '~/composables/useTools';
import { useAsyncData } from '#app';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { getDisplayBgUnified, getDisplayIconUnified } from '~/composables/useToolIcon';

type ToolMetaRuntime = {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  color?: string;
  component: any;
};

definePageMeta({ ssr: false });

const { t } = useI18n();
const route = useRoute();

/**
 * 避免 Ref 的 Ref：直接返回数组数据，防止 toolsRef.value 变成一个 Ref 对象
 */
const { data: toolsRef } = useAsyncData('tools', async () => {
  const { tools } = await useTools();
  return tools.value;
});
const tools = computed(() => (Array.isArray(toolsRef.value) ? toolsRef.value : []));
const tool = computed(() => tools.value.find((x: ToolMetaRuntime) => x.id === String(route.params.id)));
const displayBg = computed(() => getDisplayBgUnified((tool.value as any)?.color, (tool.value as any)?.category));
const displayIcon = computed(() => getDisplayIconUnified((tool.value as any)?.icon, (tool.value as any)?.category));
</script>

<style scoped>
/* 对角线扫描条（低频扫光，暗/亮自适配） */
.scanner-stripe {
  position: absolute;
  inset: -200%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 48%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.04) 52%, rgba(255, 255, 255, 0) 100%);
  animation: sweep var(--sweep-duration, 16s) linear infinite;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  pointer-events: none;
}
.dark .scanner-stripe {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 48%, rgba(255, 255, 255, 0.14) 50%, rgba(255, 255, 255, 0.05) 52%, rgba(255, 255, 255, 0) 100%);
}

@keyframes sweep {
  0% {
    transform: translateX(-30%);
  }
  50% {
    transform: translateX(30%);
  }
  100% {
    transform: translateX(-30%);
  }
}
</style>
