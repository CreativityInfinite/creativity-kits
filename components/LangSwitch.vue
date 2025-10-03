<template>
  <div class="flex items-center gap-2 text-xs">
    <UiSelect v-model="current" :options="opts" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiSelect from '~/components/ui/Select.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { locale, availableLocales, setLocale } = useI18n() as any;
const route = useRoute();
const router = useRouter();

const opts = availableLocales.map((code: string) => ({
  value: code,
  label: code === 'zh-CN' ? '中文(简)' : code === 'zh-TW' ? '中文(繁)' : code === 'en' ? 'English' : code
}));

const current = computed({
  get: () => locale.value,
  set: async (v: string) => {
    if (typeof setLocale === 'function') {
      await setLocale(v);
    } else {
      locale.value = v;
    }
    // 同步更新地址栏的 ?lang 参数（无痕替换，不新增历史记录）
    const nextQuery = { ...route.query, lang: v };
    if (typeof window !== 'undefined' && (route.path === '/' || route.path === '')) {
      const params = new URLSearchParams(nextQuery as Record<string, string>).toString();
      window.history.replaceState(null, '', params ? `?${params}` : '?');
    } else {
      await router.replace({ query: nextQuery });
    }
  }
});
</script>
