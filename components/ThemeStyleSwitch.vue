<template>
  <div class="relative">
    <button
      ref="buttonRef"
      @click="toggleMenu"
      class="rounded-lg px-3 py-2 text-xs ring-1 transition-colors bg-white text-gray-800 ring-black/10 hover:text-black dark:bg-bg-card dark:text-gray-300 dark:ring-white/10 dark:hover:text-white"
      :title="currentLabel"
    >
      <Icon icon="tabler:palette" class="w-4 h-4" />
    </button>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="menuOpen"
          class="fixed bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-2xl z-[9999] min-w-[140px]"
          :style="{
            top: menuPosition.top + 'px',
            left: menuPosition.left + 'px'
          }"
        >
          <div class="p-2">
            <button
              v-for="opt in opts"
              :key="opt.value"
              @click="selectTheme(opt.value)"
              class="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200"
              :class="[
                current === opt.value
                  ? 'bg-theme-primary/20 text-gray-900 dark:text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50'
              ]"
            >
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useThemePalette } from '~/composables/useThemePalette';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { theme, setTheme } = useThemePalette();

const menuOpen = ref(false);
const buttonRef = ref<HTMLElement>();
const menuPosition = ref({ top: 0, left: 0 });

const current = computed(() => theme.value);

const opts = computed(() => [
  { value: 'cool-blue', label: t('themes.coolBlue') },
  { value: 'cyber-purple', label: t('themes.cyberPurple') },
  { value: 'prism-laser', label: t('themes.prismLaser') }
]);

const currentLabel = computed(() => {
  const currentOpt = opts.value.find((opt) => opt.value === current.value);
  return currentOpt ? `Theme: ${currentOpt.label}` : 'Theme';
});

async function toggleMenu() {
  if (!menuOpen.value && buttonRef.value) {
    await nextTick();
    updateMenuPosition();
  }
  menuOpen.value = !menuOpen.value;
}

function updateMenuPosition() {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect();
    menuPosition.value = {
      top: rect.bottom + 8,
      left: rect.right - 140 // 右对齐，140px 是菜单最小宽度
    };
  }
}

function selectTheme(value: string) {
  setTheme(value);
  menuOpen.value = false;
}

// 监听滚动和窗口大小变化
function handleScroll() {
  if (menuOpen.value) {
    updateMenuPosition();
  }
}

function handleResize() {
  if (menuOpen.value) {
    updateMenuPosition();
  }
}

// 点击外部关闭菜单
function handleClickOutside(event: Event) {
  if (menuOpen.value && buttonRef.value && !buttonRef.value.contains(event.target as Node)) {
    menuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
