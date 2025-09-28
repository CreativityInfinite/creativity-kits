<template>
  <div class="flex items-center gap-2 text-xs">
    <UiSelect v-model="current" :options="opts" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UiSelect from '~/components/ui/Select.vue';
import { useThemePalette } from '~/composables/useThemePalette';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { theme, setTheme } = useThemePalette();

const current = computed({
  get: () => theme.value,
  set: (v: string) => setTheme(v)
});

const opts = computed(() => [
  { value: 'cool-blue', label: t('themes.coolBlue') },
  { value: 'cyber-purple', label: t('themes.cyberPurple') },
  { value: 'prism-laser', label: t('themes.prismLaser') }
]);
</script>
