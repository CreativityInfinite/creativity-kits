<template>
  <div class="mb-2 -mt-2 pb-2 pt-2 transition-all duration-500 ease-out" :class="center ? 'transform scale-105' : ''">
    <!-- 移动端折叠式标签栏 -->
    <div class="block sm:hidden">
      <div class="relative">
        <button
          ref="buttonRef"
          @click="toggleMenu"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-base font-medium ring-1 ring-white/10 transition-all duration-300 ease-out bg-theme-primary/20 text-gray-900 ring-theme-primary/50 dark:text-white shadow-lg backdrop-blur-sm"
        >
          <Icon v-if="activeTab?.icon" :icon="activeTab.icon" class="w-4 h-4" />
          <span>{{ activeTab?.label || '选择分类' }}</span>
          <Icon :icon="mobileMenuOpen ? 'tabler:chevron-up' : 'tabler:chevron-down'" class="w-4 h-4 transition-transform duration-200" />
        </button>

        <!-- 下拉菜单 - 使用 Teleport 到 body 避免被父容器裁剪 -->
        <Teleport to="body">
          <Transition name="dropdown">
            <div
              v-if="mobileMenuOpen"
              class="fixed bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-xl shadow-2xl z-[9999] max-h-[70vh] overflow-y-auto"
              :style="{
                top: menuPosition.top + 'px',
                left: menuPosition.left + 'px',
                width: menuPosition.width + 'px'
              }"
            >
              <div class="p-2">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="selectTab(tab.id)"
                  class="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200"
                  :class="[active === tab.id ? 'text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50']"
                  :style="active === tab.id ? { background: getTabBackground(tab.id) } : {}"
                >
                  <div
                    v-if="tab.icon"
                    class="w-4 h-4 flex-shrink-0 rounded flex items-center justify-center"
                    :style="active === tab.id ? { background: 'rgba(255,255,255,0.2)' } : { background: getTabBackground(tab.id) }"
                  >
                    <Icon :icon="tab.icon" class="w-3 h-3" :class="active === tab.id ? 'text-white' : 'text-white/90'" />
                  </div>
                  <span>{{ tab.label }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>

    <!-- 桌面端标签栏 -->
    <div class="hidden sm:block">
      <div class="flex flex-wrap gap-2 transition-all duration-500 ease-out" :class="center ? 'justify-center' : ''">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="handleTabChange(tab.id)"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-base font-medium ring-1 transition-all duration-300 ease-out"
          :class="[
            active === tab.id ? 'text-white ring-white/20' : 'bg-black/5 text-gray-700 hover:text-gray-900 dark:bg-bg-soft/60 dark:text-gray-300 dark:hover:text-white ring-white/10',
            center ? 'shadow-lg backdrop-blur-sm' : ''
          ]"
          :style="active === tab.id ? { background: getTabBackground(tab.id) } : {}"
        >
          <div v-if="tab.icon" class="w-4 h-4 rounded flex items-center justify-center" :style="active === tab.id ? { background: 'rgba(255,255,255,0.2)' } : { background: getTabBackground(tab.id) }">
            <Icon :icon="tab.icon" class="w-3 h-3" :class="active === tab.id ? 'text-white' : 'text-white/90'" />
          </div>
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { getDisplayBgUnified } from '~/composables/useToolIcon';

const props = defineProps<{
  tabs: { id: string; label: string; icon?: string }[];
  active: string;
  center?: boolean;
}>();

const emit = defineEmits<{ change: [id: string] }>();

const mobileMenuOpen = ref(false);
const buttonRef = ref<HTMLElement>();
const menuPosition = ref({ top: 0, left: 0, width: 0 });

const activeTab = computed(() => props.tabs.find((tab) => tab.id === props.active));

async function toggleMenu() {
  if (!mobileMenuOpen.value && buttonRef.value) {
    await nextTick();
    updateMenuPosition();
  }
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function updateMenuPosition() {
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const menuWidth = Math.max(rect.width * 1.5, Math.min(280, viewportWidth - 32)); // 至少是按钮宽度的1.5倍，最大280px，留16px边距
    const menuLeft = Math.min(rect.left, viewportWidth - menuWidth - 16); // 确保不超出右边界

    menuPosition.value = {
      top: rect.bottom + 8, // 8px gap
      left: menuLeft,
      width: menuWidth
    };
  }
}

function selectTab(id: string) {
  emit('change', id);
  mobileMenuOpen.value = false;

  // 切换标签后自动滚动到顶部
  scrollToTop();
}

function handleTabChange(id: string) {
  emit('change', id);

  // 切换标签后自动滚动到顶部
  scrollToTop();
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

const getTabBackground = (tabId: string) => {
  // 对于特殊标签使用默认渐变
  if (tabId === 'all' || tabId === 'hot' || tabId === 'new') {
    return 'linear-gradient(135deg, var(--color-primary, #38bdf8) 0%, rgba(255,255,255,0.2) 100%)';
  }
  // 对于分类标签使用与卡片相同的背景色
  return getDisplayBgUnified(null, tabId);
};

// 监听滚动和窗口大小变化，更新菜单位置
function handleScroll() {
  if (mobileMenuOpen.value) {
    updateMenuPosition();
  }
}

function handleResize() {
  if (mobileMenuOpen.value) {
    updateMenuPosition();
  }
}

// 点击外部关闭菜单
function handleClickOutside(event: Event) {
  if (mobileMenuOpen.value && buttonRef.value && !buttonRef.value.contains(event.target as Node)) {
    mobileMenuOpen.value = false;
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
