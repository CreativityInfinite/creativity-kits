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

      <!-- Search: 科技感玻璃拟态，名称/标签模糊匹配 -->
      <div class="relative mt-2 mb-3">
        <div class="group relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <input
            ref="searchInput"
            v-model="query"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            type="text"
            inputmode="search"
            :placeholder="t('home.searchPlaceholder')"
            class="w-full rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm pl-10 pr-20 h-12 text-sm md:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all duration-300 transform focus:ring-0 focus:border-transparent focus:scale-[1.01] focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)] hover:bg-white/80 dark:hover:bg-white/10"
            aria-label="搜索工具"
          />
          <!-- 右侧动效图标（不阻挡点击） -->
          <span class="pointer-events-none absolute right-10 mt top-1/2 -translate-y-1/2 transform">
            <Icon
              icon="tabler:sparkles"
              aria-hidden="true"
              class="h-6 w-6 text-fuchsia-500/70 group-focus-within:text-fuchsia-400 transition-colors duration-300 origin-center group-focus-within:rotate-12 transition-transform duration-300"
            />
          </span>
          <button
            v-if="query"
            @click="
              query = '';
              searchInput?.focus();
            "
            class="absolute inset-y-0 right-0 mr-2 my-2 px-2 rounded-lg text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label="清除搜索"
          >
            清除
          </button>
          <!-- 外环描边 -->
          <div
            class="pointer-events-none absolute -inset-px rounded-xl transition-all duration-300"
            :class="searchFocused ? 'ring-2 ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.25)]' : 'ring-1 ring-white/10'"
          ></div>
          <!-- 霓虹扫光 -->
          <div
            class="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-sky-500/0 via-fuchsia-500/10 to-emerald-400/0 blur opacity-0 group-focus-within:opacity-100 group-focus-within:animate-pulse transition-opacity duration-500"
            aria-hidden="true"
          ></div>
        </div>
      </div>

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
import Tabs from '~/components/Tabs.vue';
import ToolCard from '~/components/ToolCard.vue';
import ThemeStyleSwitch from '~/components/ThemeStyleSwitch.vue';
import ColorModeSwitch from '~/components/ColorModeSwitch.vue';
import LangSwitch from '~/components/LangSwitch.vue';
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import BackToTop from '~/components/BackToTop.vue';
import { useTools } from '~/composables/useTools';
import { isMatchFactory, sortByMatch } from '~/composables/useToolFilters';
import type { ToolMetaRuntime } from '~/types/tool';
import { useState } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { pinyin } from 'pinyin-pro';
import * as OpenCC from 'opencc-js';

const { t, tm } = useI18n();
const convS2T = OpenCC.Converter({ from: 'cn', to: 'tw' });
const convT2S = OpenCC.Converter({ from: 'tw', to: 'cn' });

// 直接顶层获取，避免 Ref 嵌套导致 tool 为 true/false/undefined
const { tools, categories, popularTag } = await useTools();

const tabs = computed(() => [
  { id: 'all', label: t('tabs.all') },
  { id: 'hot', label: t('tabs.hot') },
  { id: 'new', label: t('tabs.new') },
  ...categories.value.map((c: string) => ({ id: c, label: t(`categories.${c}`, c) }))
]);

const activeTab = ref('all');

const sentinel = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;
// 用于与 app.vue 顶部开关联动隐藏：Tabs 一旦吸顶则隐藏右上角开关
const headerSwitchesHidden = useState('headerSwitchesHidden', () => false);
const tabsSticky = computed(() => headerSwitchesHidden.value);

const query = ref('');
const searchFocused = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const normalizedQuery = computed(() => query.value.trim().toLowerCase());

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.key === '/' || e.key === 's') && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    searchInput.value?.focus();
  } else if (e.key === 'Escape') {
    if (query.value) {
      query.value = '';
    } else {
      (e.target as HTMLElement | null)?.blur?.();
    }
  }
}

onMounted(() => {
  if (!sentinel.value) return;
  io = new IntersectionObserver(
    (entries) => {
      const e = entries[0];
      // 当 sentinel 不可见 => Tabs 已吸顶（卡在顶部），隐藏右上角
      headerSwitchesHidden.value = !e.isIntersecting;
    },
    { root: null, threshold: 0 }
  );
  io.observe(sentinel.value);
  window.addEventListener('keydown', onGlobalKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown);
  if (io && sentinel.value) io.unobserve(sentinel.value);
  io = null;
  // 页面离开时恢复显示
  headerSwitchesHidden.value = false;
});

const isTabMatch = isMatchFactory(activeTab, popularTag);

// 规范化工具函数
function norm(s: string) {
  return (s || '').toLowerCase().trim();
}
function collapse(s: string) {
  return norm(s).replace(/\s+/g, '');
}
function toPinyin(s: string) {
  // 去掉声调、空格紧凑
  try {
    return collapse(pinyin(s, { toneType: 'none', type: 'array' }).join(' '));
  } catch {
    return '';
  }
}
function variantsForText(s: string) {
  const base = norm(s);
  const baseT = convS2T(s);
  const baseS = convT2S(s);
  return Array.from(new Set([base, collapse(base), norm(baseS), collapse(baseS), norm(baseT), collapse(baseT), toPinyin(base), toPinyin(baseS), toPinyin(baseT)])).filter(Boolean);
}
function variantsForTags(items: any[]) {
  const texts = items.map((it) => (typeof it === 'string' ? it : (it?.body?.static ?? it?.text ?? ''))).filter(Boolean) as string[];
  const joined = texts.join(' ');
  return variantsForText(joined);
}

function anyIncludes(haystackList: string[], needleList: string[]) {
  return haystackList.some((h) => needleList.some((n) => n && h.includes(n)));
}

function isMatch(tool: ToolMetaRuntime) {
  if (!tool) return false;
  if (!isTabMatch(tool)) return false;

  const q = normalizedQuery.value;
  if (!q) return true;

  // 用户输入的多形态（简体/繁体/紧凑/拼音）
  const qVariants = variantsForText(q);

  // 本地化名称与标签
  const localizedName = typeof tool.name === 'string' ? t(tool.name) : '';
  const localizedTags = typeof tool.tags === 'string' ? (tm as any)(tool.tags) : [];

  // 构建待匹配的候选形态
  const nameVariants = variantsForText(localizedName);
  const tagVariants = Array.isArray(localizedTags) ? variantsForTags(localizedTags) : [];

  // 原始键回退（不做拼音，仅键值匹配）
  const rawVariants = [norm(String(tool.name || '')), norm(String(tool.tags || ''))].filter(Boolean);

  return anyIncludes(nameVariants, qVariants) || anyIncludes(tagVariants, qVariants) || rawVariants.some((rv) => rv.includes(norm(q)));
}
const sortedTools = computed(() => {
  const list = tools.value || [];
  return [...list].sort(sortByMatch(isMatch as (t: ToolMetaRuntime) => boolean));
});

function onTabChange(id: string) {
  activeTab.value = id;
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
