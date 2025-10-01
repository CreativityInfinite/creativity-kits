<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.macaddress-vendor-lookup.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.macaddress-vendor-lookup.page.description') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.macaddress-vendor-lookup.page.inputLabel') }} </label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('tools.macaddress-vendor-lookup.page.inputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.macaddress-vendor-lookup.page.process') }}</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> {{ $t('tools.macaddress-vendor-lookup.page.outputLabel') }} </label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            :placeholder="$t('tools.macaddress-vendor-lookup.page.outputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.macaddress-vendor-lookup.page.copyResult') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const input = ref('');
const { t } = useI18n();
const output = ref('');

async function process() {
  const raw = input.value.trim();
  if (!raw) {
    output.value = '';
    return;
  }
  const mac = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  if (mac.length !== 12) {
    output.value = t('tools.macaddress-vendor-lookup.page.formatError');
    return;
  }
  const oui = mac.slice(0, 6);
  const localMap: Record<string, string> = {
    // 常见示例（可按需扩充）
    '000C29': 'VMware, Inc.',
    '00163E': 'Apple, Inc.',
    F4F5E8: 'HUAWEI TECHNOLOGIES CO.,LTD',
    F0D5BF: 'Hangzhou Hikvision Digital Technology Co.,Ltd.',
    '44D9E7': 'Xiaomi Communications Co Ltd',
    D85D4C: 'Hon Hai Precision Ind. Co.,Ltd. (Foxconn)'
  };
  if (localMap[oui]) {
    output.value = t('tools.macaddress-vendor-lookup.page.localHit', { vendor: localMap[oui] });
    return;
  }
  output.value = t('tools.macaddress-vendor-lookup.page.querying');
  try {
    // macvendors.com 返回纯文本厂商名
    const res = await fetch(`https://api.macvendors.com/${mac}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const vendor = await res.text();
    output.value = vendor || t('tools.macaddress-vendor-lookup.page.notFound');
  } catch (e: any) {
    const msg = e?.message || String(e);
    output.value = t('tools.macaddress-vendor-lookup.page.queryFailedWithHint', { msg });
  }
}

async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('common.copied'));
  } catch (err) {
    console.error(t('tools.macaddress-vendor-lookup.page.copyFailedLog'), err);
    alert(t('tools.macaddress-vendor-lookup.page.copyFailedRetry'));
  }
}
</script>
