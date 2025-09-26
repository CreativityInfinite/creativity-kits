<template>
  <transition name="bt" appear>
    <button v-if="visible" class="futuristic-btn fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 group" @click="toTop" aria-label="Back to top">
      <span class="btn-core">
        <span class="ring-spin" aria-hidden="true"></span>
        <span class="ring-glow" aria-hidden="true"></span>
        <svg class="icon-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M10 3a.75.75 0 01.53.22l5.25 5.25a.75.75 0 11-1.06 1.06L10.75 5.56v10.69a.75.75 0 01-1.5 0V5.56L5.28 9.53a.75.75 0 11-1.06-1.06l5.25-5.25A.75.75 0 0110 3z"
            clip-rule="evenodd"
          />
        </svg>
        <span class="label">{{ t('common.backToTop') }}</span>
      </span>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const visible = ref(false)
// 提前出现阈值：滚动超过一定像素即显示
const SHOW_OFFSET = 120 // px - 更早显示，提升用户体验

function onScroll() {
  const scrollY = window.scrollY || window.pageYOffset
  // 尽快展示：滚动超过小阈值即可显示，不必到最底部
  visible.value = scrollY > SHOW_OFFSET
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
/* 过渡出现/隐藏 */
.bt-enter-active,
.bt-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}
.bt-enter-from,
.bt-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* 科技风持续动效按钮 */
.futuristic-btn {
  --size: 46px;
  --ring: 1px;
  --bg: rgba(17, 17, 22, 0.6);
  --bg-light: rgba(255, 255, 255, 0.9);
  --fg: #e5e7eb;
  --fg-dark: #111827;
  position: fixed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--size);
  height: auto;
  padding: 10px;
  border-radius: 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25), inset 0 0 0 var(--ring) rgba(255, 255, 255, 0.08);
  color: var(--fg);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
}
:root.dark .futuristic-btn {
  background: var(--bg);
}
:root:not(.dark) .futuristic-btn {
  background: var(--bg-light);
  color: var(--fg-dark);
}

.futuristic-btn .btn-core {
  position: relative;
  display: inline-flex;
  flex-direction: column; /* 纵向排列：图标在上，文字在下 */
  align-items: center;
  gap: 6px;
  z-index: 1;
}

/* 旋转彩环 */
.futuristic-btn .ring-spin {
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  background: conic-gradient(from 0deg, #7c3aed, #06b6d4, #34d399, #7c3aed);
  filter: blur(10px) saturate(120%);
  opacity: 0.35;
  animation: spin360 6s linear infinite;
  z-index: 0;
}

/* 呼吸光晕 */
.futuristic-btn .ring-glow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  box-shadow: 0 0 24px rgba(124, 58, 237, 0.35), 0 0 30px rgba(6, 182, 212, 0.18) inset;
  animation: glow 2.6s ease-in-out infinite;
  z-index: 0;
}

.futuristic-btn .icon-arrow {
  width: 18px;
  height: 18px;
  transform: translateY(0);
  animation: floatUp 1.8s ease-in-out infinite;
}

/* 文本轻微闪烁扫光 */
.futuristic-btn .label {
  font-size: 12px;
  letter-spacing: 0.2px;
  position: relative;
  overflow: hidden;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .futuristic-btn {
    --size: 42px;
    padding: 8px;
    border-radius: 12px;
  }

  .futuristic-btn .icon-arrow {
    width: 16px;
    height: 16px;
  }

  .futuristic-btn .label {
    font-size: 11px;
  }
}

/* 悬停微交互 */
.futuristic-btn:hover .icon-arrow {
  transform: translateY(-2px);
}
.futuristic-btn:active {
  transform: translateY(1px);
}

/* Keyframes */
@keyframes spin360 {
  to {
    transform: rotate(360deg);
  }
}
@keyframes glow {
  0%,
  100% {
    opacity: 0.35;
    filter: blur(8px);
  }
  50% {
    opacity: 0.6;
    filter: blur(12px);
  }
}
@keyframes floatUp {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
@keyframes sweep {
  0% {
    left: -120%;
  }
  100% {
    left: 120%;
  }
}
</style>
