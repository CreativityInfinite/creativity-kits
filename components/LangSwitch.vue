<template>
  <div class="flex items-center gap-2 text-xs">
    <UiSelect v-model="current" :options="opts" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiSelect from '~/components/ui/Select.vue';
import { useI18n } from 'vue-i18n';

const { locale, availableLocales, setLocale } = useI18n() as any;

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
  }
});
</script>
