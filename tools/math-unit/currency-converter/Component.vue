<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.currency-converter.page.from') }}</label>
        <div class="flex gap-2">
          <input
            v-model.number="fromAmount"
            @input="convert"
            type="number"
            step="0.01"
            class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            :placeholder="$t('tools.currency-converter.page.inputPlaceholder')"
          />
          <select v-model="fromCurrency" @change="convert" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.code }} - {{ currency.name }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.currency-converter.page.to') }}</label>
        <div class="flex gap-2">
          <input
            v-model="toAmount"
            readonly
            class="flex-1 px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono"
            :placeholder="$t('tools.currency-converter.page.resultPlaceholder')"
          />
          <select v-model="toCurrency" @change="convert" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.code }} - {{ currency.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="swapCurrencies" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.currency-converter.page.swapCurrencies') }}</button>
    </div>

    <div v-if="exchangeRate" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div class="text-sm text-blue-800 dark:text-blue-200">
        <p>{{ $t('tools.currency-converter.page.ratePrefix') }} 1 {{ fromCurrency }} = {{ exchangeRate }} {{ toCurrency }}</p>
        <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">{{ $t('tools.currency-converter.page.rateDisclaimer') }}</p>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.currency-converter.page.notesTitle') }}</h3>
      <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <li>{{ $t('tools.currency-converter.page.noteDataSource') }}</li>
        <li>{{ $t('tools.currency-converter.page.noteDisclaimer') }}</li>
        <li>{{ $t('tools.currency-converter.page.noteSupported') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const fromAmount = ref(1);
const toAmount = ref('');
const fromCurrency = ref('USD');
const toCurrency = ref('CNY');
const exchangeRate = ref('');

const currencies = [
  { code: 'USD', name: '美元' },
  { code: 'CNY', name: '人民币' },
  { code: 'EUR', name: '欧元' },
  { code: 'JPY', name: '日元' },
  { code: 'GBP', name: '英镑' },
  { code: 'AUD', name: '澳元' },
  { code: 'CAD', name: '加元' },
  { code: 'CHF', name: '瑞士法郎' },
  { code: 'HKD', name: '港币' },
  { code: 'SGD', name: '新加坡元' }
];

// 模拟汇率数据（实际应用中应该从API获取）
const mockRates: Record<string, Record<string, number>> = {
  USD: { CNY: 7.2, EUR: 0.85, JPY: 110, GBP: 0.73, AUD: 1.35, CAD: 1.25, CHF: 0.92, HKD: 7.8, SGD: 1.35 },
  CNY: { USD: 0.139, EUR: 0.118, JPY: 15.28, GBP: 0.101, AUD: 0.188, CAD: 0.174, CHF: 0.128, HKD: 1.08, SGD: 0.188 },
  EUR: { USD: 1.18, CNY: 8.47, JPY: 129.5, GBP: 0.86, AUD: 1.59, CAD: 1.47, CHF: 1.08, HKD: 9.2, SGD: 1.59 }
};

function convert() {
  if (!fromAmount.value || fromCurrency.value === toCurrency.value) {
    toAmount.value = fromAmount.value?.toString() || '';
    exchangeRate.value = '1';
    return;
  }

  // 使用模拟汇率
  const rate = mockRates[fromCurrency.value]?.[toCurrency.value] || 1;
  const result = fromAmount.value * rate;

  toAmount.value = result.toFixed(2);
  exchangeRate.value = rate.toFixed(4);
}

function swapCurrencies() {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  convert();
}

// 初始转换
convert();
</script>
