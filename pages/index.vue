<template>
  <div class="relative">
    <!-- 全屏科技感背景层 -->
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

    <!-- 全页面浮动粒子动画 -->
    <div class="floating-particles-global absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-300" :class="{ 'particles-visible': particlesVisible }">
      <div
        class="particle-global"
        v-for="n in 20"
        :key="n"
        :style="{
          animationDelay: Math.random() * 15 + 2 + 's',
          left: Math.random() * 100 + '%',
          animationDuration: 12 + Math.random() * 8 + 's'
        }"
      ></div>
    </div>

    <main id="top" class="mx-auto relative max-w-7xl px-4 pb-16 pt-20 md:pt-24 lg:pt-28">
      <!-- 页面头部 -->
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

      <!-- 搜索框：科技感玻璃拟态设计 -->
      <div class="relative mt-2 mb-3">
        <div class="group relative">
          <!-- 搜索图标 -->
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg class="h-5 w-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <!-- 搜索输入框 -->
          <input
            ref="searchInput"
            v-model="query"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            type="text"
            inputmode="search"
            :placeholder="t('home.searchPlaceholder')"
            class="w-full rounded-xl bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300/40 dark:border-white/10 shadow-lg pl-10 pr-20 h-12 text-sm md:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 outline-none transition-all duration-300 transform focus:ring-0 focus:border-sky-400/50 focus:scale-[1.01] focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)] hover:bg-white/95 dark:hover:bg-white/10 hover:border-gray-400/50 dark:hover:border-white/20"
            aria-label="搜索工具"
          />

          <!-- 外环描边效果 -->
          <div
            class="pointer-events-none absolute -inset-px rounded-xl transition-all duration-300"
            :class="searchFocused ? 'ring-2 ring-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.25)]' : 'ring-1 ring-gray-200/30 dark:ring-white/10'"
          ></div>

          <!-- 右侧装饰图标 -->
          <span class="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 transform">
            <Icon
              icon="tabler:sparkles"
              aria-hidden="true"
              class="h-6 w-6 text-fuchsia-500/70 group-focus-within:text-fuchsia-400 transition-colors duration-300 origin-center group-focus-within:rotate-12 transition-transform duration-300"
            />
          </span>

          <!-- 清除按钮 -->
          <button
            v-if="query"
            @click="
              query = '';
              searchInput?.focus();
            "
            class="absolute inset-y-0 right-0 mr-2 my-2 px-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center justify-center"
            aria-label="清除搜索"
          >
            <Icon icon="tdesign:clear-filled" class="w-4 h-4" />
          </button>

          <!-- 霓虹扫光效果 -->
          <div
            class="pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-sky-500/0 via-fuchsia-500/10 to-emerald-400/0 blur opacity-0 group-focus-within:opacity-100 group-focus-within:animate-pulse transition-opacity duration-500"
            aria-hidden="true"
          ></div>
        </div>
      </div>

      <!-- 标签栏吸顶检测元素 -->
      <div ref="sentinel" class="h-1 -mt-1" aria-hidden="true"></div>

      <!-- 标签栏区域 -->
      <div class="-mx-4 mb-6 px-4 pt-4 pb-2 sticky top-0 z-30 transition-all duration-500 ease-out">
        <div class="relative rounded-xl">
          <!-- 吸顶时的渐变遮罩 -->
          <transition name="tabmask">
            <div v-if="tabsSticky" class="pointer-events-none absolute inset-0 -mx-4 px-4" aria-hidden="true">
              <div class="h-12 -mt-2 w-full bg-gradient-to-b from-white/95 via-white/85 to-white/20 dark:from-bg/95 dark:via-bg/85 dark:to-bg/20 backdrop-blur-sm"></div>
            </div>
          </transition>
          <Tabs :tabs="tabs" :active="activeTab" :center="tabsSticky" class="" @change="onTabChange" />
        </div>
      </div>

      <!-- 工具卡片网格区域 -->
      <div class="relative">
        <TransitionGroup name="grid" tag="div" class="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" appear>
          <ToolCard v-for="tool in sortedTools" :key="tool.id" :tool="tool" :active="isMatch(tool)" :disabled="!isMatch(tool)" class="duration-500 ease-out" />
        </TransitionGroup>
      </div>

      <!-- 联系方式区域 -->
      <div class="contact-section mt-20 mb-12">
        <div class="contact-container relative">
          <!-- 联系方式标题和标语 -->
          <div class="contact-header text-center mb-12">
            <div class="contact-title-wrapper relative">
              <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3 relative z-10">
                {{ t('contact.title') }}
              </h3>
              <div class="title-glow absolute inset-0 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-fuchsia-500 to-emerald-400 blur-sm opacity-50">
                {{ t('contact.title') }}
              </div>
            </div>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-4 font-medium">
              {{ t('contact.slogan') }}
            </p>
            <div class="title-line mx-auto h-[3px] w-24 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-400 rounded-full relative">
              <div class="absolute inset-0 bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-400 rounded-full blur-sm opacity-60"></div>
            </div>
          </div>

          <!-- 联系方式卡片 -->
          <div class="contact-items flex flex-col sm:flex-row gap-8 justify-center items-center max-w-3xl mx-auto">
            <!-- 微信联系卡片 -->
            <div class="contact-item group relative cursor-pointer transform transition-all duration-500 hover:scale-105" @click="copyToClipboard('17695796264', 'wechat')">
              <div
                class="contact-card relative p-8 rounded-3xl bg-white/95 dark:bg-white/5 backdrop-blur-xl border border-gray-200/40 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
              >
                <!-- 背景渐变覆盖层 -->
                <div class="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-600/5 dark:from-green-400/10 dark:to-emerald-600/10"></div>

                <!-- 图标区域 -->
                <div class="contact-icon-wrapper relative flex items-center justify-center mb-6">
                  <div
                    class="contact-icon wechat-icon relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-500"
                  >
                    <Icon icon="ri:wechat-fill" class="w-8 h-8" />
                  </div>
                  <div class="pulse-ring absolute inset-0 rounded-2xl border-2 border-green-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  <div class="glow-ring absolute inset-0 rounded-2xl bg-green-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <!-- 联系信息 -->
                <div class="contact-info text-center relative z-10">
                  <span class="contact-label block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    {{ t('contact.wechat') }}
                  </span>
                  <span class="contact-value block text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">17695796264</span>
                  <span class="contact-hint block text-xs text-gray-500 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {{ t('contact.clickToCopy') }}
                  </span>
                </div>

                <!-- 动画边框效果 -->
                <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
                <div class="hover-effect absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            <!-- 官网联系卡片 -->
            <div class="contact-item group relative cursor-pointer transform transition-all duration-500 hover:scale-105" @click="openWebsite">
              <div
                class="contact-card relative p-8 rounded-3xl bg-white/95 dark:bg-white/5 backdrop-blur-xl border border-gray-200/40 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
              >
                <!-- 背景渐变覆盖层 -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-600/5 dark:from-blue-400/10 dark:to-purple-600/10"></div>

                <!-- 图标区域 -->
                <div class="contact-icon-wrapper relative flex items-center justify-center mb-6">
                  <div
                    class="contact-icon website-icon relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-all duration-500"
                  >
                    <Icon icon="ri:global-line" class="w-8 h-8" />
                  </div>
                  <div class="pulse-ring absolute inset-0 rounded-2xl border-2 border-blue-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  <div class="glow-ring absolute inset-0 rounded-2xl bg-blue-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <!-- 联系信息 -->
                <div class="contact-info text-center relative z-10">
                  <span class="contact-label block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    {{ t('contact.website') }}
                  </span>
                  <span class="contact-value block text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">creativityinfinite.com</span>
                  <span class="contact-hint block text-xs text-gray-500 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {{ t('contact.clickToVisit') }}
                  </span>
                </div>

                <!-- 动画边框效果 -->
                <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
                <div class="hover-effect absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          <!-- 装饰元素 -->
          <div class="contact-decorations absolute inset-0 pointer-events-none">
            <div
              class="deco-circle absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-sky-400/5 to-fuchsia-500/5 dark:from-sky-400/10 dark:to-fuchsia-500/10 blur-2xl animate-pulse transition-all duration-300"
            ></div>
            <div
              class="deco-circle absolute bottom-10 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400/5 to-blue-500/5 dark:from-emerald-400/10 dark:to-blue-500/10 blur-2xl animate-pulse transition-all duration-300"
              style="animation-delay: 2s"
            ></div>
          </div>
        </div>
      </div>

      <!-- 复制成功弹窗通知 -->
      <Transition name="toast">
        <div
          v-if="showToast"
          class="toast-notification fixed top-20 right-6 z-50 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xl overflow-hidden"
        >
          <div class="p-4">
            <div class="flex items-center gap-3">
              <div class="toast-icon w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                <Icon icon="ri:check-line" class="w-4 h-4 text-white" />
              </div>
              <div class="toast-content">
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ toastMessage }}</p>
              </div>
            </div>
          </div>
          <div
            class="toast-progress absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-3000 ease-linear"
            :style="{ width: toastProgress + '%' }"
          ></div>
        </div>
      </Transition>
    </main>
  </div>

  <BackToTop />
</template>

<script setup lang="ts">
// ==================== 组件导入 ====================
import Tabs from '~/components/Tabs.vue';
import ToolCard from '~/components/ToolCard.vue';
import BackToTop from '~/components/BackToTop.vue';
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useTools } from '~/composables/useTools';
import { isMatchFactory, sortByMatch } from '~/composables/useToolFilters';
import type { ToolMetaRuntime } from '~/types/tool';
import { useState } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { pinyin } from 'pinyin-pro';
import * as OpenCC from 'opencc-js';

// ==================== 国际化和转换器 ====================
const { t, tm } = useI18n();
const convS2T = OpenCC.Converter({ from: 'cn', to: 'tw' });
const convT2S = OpenCC.Converter({ from: 'tw', to: 'cn' });

// ==================== 工具数据获取 ====================
const { tools, categories, popularTag } = await useTools();

// ==================== 标签栏配置 ====================
const tabs = computed(() => [
  { id: 'all', label: t('tabs.all') },
  { id: 'hot', label: t('tabs.hot') },
  { id: 'new', label: t('tabs.new') },
  ...categories.value.map((c: string) => ({ id: c, label: t(`categories.${c}`, c) }))
]);

const activeTab = ref('all');

// ==================== 标签栏吸顶逻辑 ====================
const sentinel = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;
const headerSwitchesHidden = useState('headerSwitchesHidden', () => false);
const tabsSticky = computed(() => headerSwitchesHidden.value);

// ==================== 搜索功能 ====================
const query = ref('');
const searchFocused = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const normalizedQuery = computed(() => query.value.trim().toLowerCase());

// ==================== 粒子动画控制 ====================
const particlesVisible = ref(false);

// 全局键盘快捷键
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

// ==================== 生命周期钩子 ====================
onMounted(() => {
  if (!sentinel.value) return;
  io = new IntersectionObserver(
    (entries) => {
      const e = entries[0];
      headerSwitchesHidden.value = !e.isIntersecting;
    },
    { root: null, threshold: 0 }
  );
  io.observe(sentinel.value);
  window.addEventListener('keydown', onGlobalKeydown);

  // 延迟显示粒子动画，避免页面加载时在顶部显示
  setTimeout(() => {
    particlesVisible.value = true;
  }, 100);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown);
  if (io && sentinel.value) io.unobserve(sentinel.value);
  io = null;
  headerSwitchesHidden.value = false;
});

// ==================== 搜索匹配逻辑 ====================
const isTabMatch = isMatchFactory(activeTab, popularTag);

// 文本规范化工具函数
function norm(s: string) {
  return (s || '').toLowerCase().trim();
}

function collapse(s: string) {
  return norm(s).replace(/\s+/g, '');
}

function toPinyin(s: string) {
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

// 工具匹配函数
function isMatch(tool: ToolMetaRuntime) {
  if (!tool) return false;
  if (!isTabMatch(tool)) return false;

  const q = normalizedQuery.value;
  if (!q) return true;

  const qVariants = variantsForText(q);
  const localizedName = typeof tool.name === 'string' ? t(tool.name) : '';
  const localizedTags = typeof tool.tags === 'string' ? (tm as any)(tool.tags) : [];
  const nameVariants = variantsForText(localizedName);
  const tagVariants = Array.isArray(localizedTags) ? variantsForTags(localizedTags) : [];
  const rawVariants = [norm(String(tool.name || '')), norm(String(tool.tags || ''))].filter(Boolean);

  return anyIncludes(nameVariants, qVariants) || anyIncludes(tagVariants, qVariants) || rawVariants.some((rv) => rv.includes(norm(q)));
}

// 排序后的工具列表
const sortedTools = computed(() => {
  const list = tools.value || [];
  return [...list].sort(sortByMatch(isMatch as (t: ToolMetaRuntime) => boolean));
});

// 标签切换处理
function onTabChange(id: string) {
  activeTab.value = id;
}

// ==================== 弹窗通知状态 ====================
const showToast = ref(false);
const toastMessage = ref('');
const toastProgress = ref(100);
let toastTimer: number | null = null;

// ==================== 联系方式功能 ====================
// 复制到剪贴板
function copyToClipboard(text: string, type: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToastNotification(t('contact.copySuccess', { type: t(`contact.${type}`) }));
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
      showToastNotification(t('contact.copyError'));
    });
}

// 打开官网
function openWebsite() {
  window.open('https://www.creativityinfinite.com/', '_blank');
}

// 显示弹窗通知
function showToastNotification(message: string) {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastMessage.value = message;
  showToast.value = true;
  toastProgress.value = 100;

  // 进度条动画
  const progressInterval = setInterval(() => {
    toastProgress.value -= 2;
    if (toastProgress.value <= 0) {
      clearInterval(progressInterval);
    }
  }, 60);

  // 3秒后隐藏弹窗
  toastTimer = setTimeout(() => {
    showToast.value = false;
    clearInterval(progressInterval);
  }, 3000);
}
</script>

<style lang="scss" scoped>
/* ==================== 工具卡片网格过渡动画 ==================== */
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

/* 列表重排时的移动过渡 */
.grid-move {
  transition: transform 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ==================== 标签栏吸顶遮罩动画 ==================== */
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

/* ==================== 联系方式区域样式 ==================== */
.contact-section {
  position: relative;
  background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.01) 50%, transparent 100%);
  transition: background 0.3s ease;
}

.dark .contact-section {
  background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.02) 50%, transparent 100%);
}

.contact-container {
  position: relative;
  z-index: 10;
}

.contact-header {
  position: relative;
}

.contact-title-wrapper {
  display: inline-block;
}

.title-glow {
  pointer-events: none;
}

/* ==================== 联系卡片样式 ==================== */
.contact-card {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }
}

.contact-item {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-8px) scale(1.02);

    .contact-card::before {
      left: 100%;
    }

    .contact-icon {
      transform: scale(1.15) rotate(8deg);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
  }
}

.contact-icon {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.contact-hint {
  transition: all 0.3s ease;
}

.contact-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* ==================== 联系卡片动画效果 ==================== */
.pulse-ring {
  animation-duration: 2s;
  animation-iteration-count: infinite;
}

.glow-ring {
  animation: glow-pulse 2s infinite;
}

.deco-circle {
  animation: float-decoration 8s infinite ease-in-out;
  transition:
    background 0.3s ease,
    opacity 0.3s ease;
}

/* ==================== 全页面浮动粒子动画 ==================== */
.floating-particles-global {
  position: fixed;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -10;
  opacity: 0;

  &.particles-visible {
    opacity: 0.6;
  }
}

.dark .floating-particles-global.particles-visible {
  opacity: 1;
}

.particle-global {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  top: -10px;
  animation: float-particle-random infinite linear;
  transition:
    opacity 0.3s ease,
    box-shadow 0.3s ease;

  // 随机大小
  &:nth-child(5n + 1) {
    width: 4px;
    height: 4px;
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  }

  &:nth-child(5n + 2) {
    width: 6px;
    height: 6px;
    background: linear-gradient(45deg, #f59e0b, #ef4444);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
  }

  &:nth-child(5n + 3) {
    width: 8px;
    height: 8px;
    background: linear-gradient(45deg, #10b981, #06b6d4);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
  }

  &:nth-child(5n + 4) {
    width: 5px;
    height: 5px;
    background: linear-gradient(45deg, #8b5cf6, #ec4899);
    box-shadow: 0 0 9px rgba(139, 92, 246, 0.3);
  }

  &:nth-child(5n) {
    width: 7px;
    height: 7px;
    background: linear-gradient(45deg, #06b6d4, #10b981, #3b82f6);
    box-shadow: 0 0 11px rgba(6, 182, 212, 0.4);
  }

  // 随机动画变体
  &:nth-child(odd) {
    animation-name: float-particle-zigzag;
  }

  &:nth-child(3n) {
    animation-name: float-particle-spiral;
  }

  &:nth-child(7n) {
    animation-name: float-particle-wave;
  }
}

.dark .particle-global {
  opacity: 0.7;

  &:nth-child(5n + 1) {
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
  }

  &:nth-child(5n + 2) {
    box-shadow: 0 0 14px rgba(245, 158, 11, 0.6);
  }

  &:nth-child(5n + 3) {
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);
  }

  &:nth-child(5n + 4) {
    box-shadow: 0 0 13px rgba(139, 92, 246, 0.5);
  }

  &:nth-child(5n) {
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.6);
  }
}

/* ==================== 弹窗通知样式 ==================== */
.toast-notification {
  animation: toast-slide-in 0.3s ease-out;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-progress {
  animation: progress-shrink 3s linear forwards;
}

/* ==================== 动画关键帧 ==================== */
@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

// 基础随机上升动画
@keyframes float-particle-random {
  0% {
    transform: translateY(120vh) translateX(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  5% {
    opacity: 0.4;
    transform: translateY(110vh) translateX(10px) rotate(45deg) scale(1);
  }
  20% {
    transform: translateY(85vh) translateX(-15px) rotate(120deg) scale(1.1);
  }
  40% {
    transform: translateY(60vh) translateX(20px) rotate(200deg) scale(0.9);
  }
  60% {
    transform: translateY(40vh) translateX(-10px) rotate(280deg) scale(1.2);
  }
  80% {
    transform: translateY(20vh) translateX(5px) rotate(340deg) scale(1);
  }
  95% {
    opacity: 0.4;
    transform: translateY(5vh) translateX(0px) rotate(360deg) scale(1);
  }
  100% {
    transform: translateY(-5vh) translateX(0) rotate(380deg) scale(0);
    opacity: 0;
  }
}

// Z字形上升动画
@keyframes float-particle-zigzag {
  0% {
    transform: translateY(120vh) translateX(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  8% {
    opacity: 0.7;
    transform: translateY(105vh) translateX(30px) rotate(60deg) scale(1);
  }
  25% {
    transform: translateY(80vh) translateX(-40px) rotate(150deg) scale(1.1);
  }
  45% {
    transform: translateY(55vh) translateX(35px) rotate(240deg) scale(0.8);
  }
  65% {
    transform: translateY(35vh) translateX(-25px) rotate(300deg) scale(1.3);
  }
  85% {
    transform: translateY(15vh) translateX(15px) rotate(350deg) scale(1);
  }
  95% {
    opacity: 0.7;
    transform: translateY(5vh) translateX(0px) rotate(360deg) scale(1);
  }
  100% {
    transform: translateY(-5vh) translateX(0) rotate(380deg) scale(0);
    opacity: 0;
  }
}

// 螺旋上升动画
@keyframes float-particle-spiral {
  0% {
    transform: translateY(120vh) translateX(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  6% {
    opacity: 0.8;
    transform: translateY(108vh) translateX(20px) rotate(90deg) scale(1);
  }
  22% {
    transform: translateY(85vh) translateX(0) rotate(180deg) scale(1.2);
  }
  38% {
    transform: translateY(62vh) translateX(-20px) rotate(270deg) scale(0.9);
  }
  54% {
    transform: translateY(42vh) translateX(0) rotate(360deg) scale(1.1);
  }
  70% {
    transform: translateY(25vh) translateX(15px) rotate(450deg) scale(1);
  }
  86% {
    transform: translateY(10vh) translateX(0) rotate(520deg) scale(1);
  }
  95% {
    opacity: 0.8;
    transform: translateY(5vh) translateX(-5px) rotate(540deg) scale(1);
  }
  100% {
    transform: translateY(-5vh) translateX(-10px) rotate(560deg) scale(0);
    opacity: 0;
  }
}

// 波浪上升动画
@keyframes float-particle-wave {
  0% {
    transform: translateY(120vh) translateX(0) rotate(0deg) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
    transform: translateY(100vh) translateX(25px) rotate(72deg) scale(1);
  }
  22% {
    transform: translateY(82vh) translateX(0) rotate(144deg) scale(1.1);
  }
  34% {
    transform: translateY(65vh) translateX(-30px) rotate(216deg) scale(0.8);
  }
  46% {
    transform: translateY(48vh) translateX(0) rotate(288deg) scale(1.2);
  }
  58% {
    transform: translateY(32vh) translateX(20px) rotate(360deg) scale(1);
  }
  70% {
    transform: translateY(20vh) translateX(0) rotate(432deg) scale(0.9);
  }
  82% {
    transform: translateY(10vh) translateX(-15px) rotate(504deg) scale(1);
  }
  94% {
    opacity: 0.6;
    transform: translateY(5vh) translateX(0px) rotate(540deg) scale(1);
  }
  100% {
    transform: translateY(-5vh) translateX(0) rotate(576deg) scale(0);
    opacity: 0;
  }
}

@keyframes float-decoration {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* ==================== 响应式布局 ==================== */
@media (max-width: 640px) {
  .contact-items {
    flex-direction: column;
    gap: 1.5rem;
  }

  .contact-card {
    padding: 2rem 1.5rem;
  }

  .contact-header h3 {
    font-size: 2rem;
  }

  .contact-icon {
    width: 3.5rem;
    height: 3.5rem;

    svg {
      width: 1.75rem;
      height: 1.75rem;
    }
  }
}

@media (max-width: 480px) {
  .contact-section {
    margin-top: 3rem;
    margin-bottom: 2rem;
  }

  .contact-header {
    margin-bottom: 2rem;
  }
}
</style>
