<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.unit-converter.page.leftTitle') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.unit-converter.page.typeLabel') }}</label>
            <select v-model="selectedCategory" @change="resetValues" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.unit-converter.page.inputLabel') }}</label>
            <input
              v-model="inputValue"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.unit-converter.page.inputPlaceholder')"
              @input="convert"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.unit-converter.page.fromUnit') }}</label>
            <select v-model="fromUnit" @change="convert" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.symbol }})</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.unit-converter.page.toUnit') }}</label>
            <select v-model="toUnit" @change="convert" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.symbol }})</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button @click="swapUnits" :disabled="!fromUnit || !toUnit" class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.unit-converter.page.swapUnits') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.unit-converter.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.unit-converter.page.rightTitle') }}</h3>

        <div v-if="result !== null" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="text-center">
              <div class="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">
                {{ formatNumber(result) }}
              </div>
              <div class="text-lg text-gray-600 dark:text-gray-400">{{ getUnitInfo(toUnit)?.name }} ({{ getUnitInfo(toUnit)?.symbol }})</div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.unit-converter.page.formulaLabel') }}</span>
                <span class="font-mono">{{ getConversionFormula() }}</span>
              </div>
            </div>

            <div class="mt-3 flex gap-2">
              <button @click="copyResult" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">{{ $t('tools.unit-converter.page.copyResult') }}</button>
              <button @click="saveToHistory" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">{{ $t('tools.unit-converter.page.saveRecord') }}</button>
            </div>
          </div>

          <div v-if="selectedCategory === 'temperature'" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.unit-converter.page.temperatureTable') }}</h4>
            <div class="grid grid-cols-1 gap-2 text-sm">
              <div class="flex justify-between">
                <span>{{ $t('tools.unit-converter.page.celsius') }}</span>
                <span class="font-mono">{{ getTemperatureValue('celsius').toFixed(2) }}°C</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('tools.unit-converter.page.fahrenheit') }}</span>
                <span class="font-mono">{{ getTemperatureValue('fahrenheit').toFixed(2) }}°F</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('tools.unit-converter.page.kelvin') }}</span>
                <span class="font-mono">{{ getTemperatureValue('kelvin').toFixed(2) }}K</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('tools.unit-converter.page.rankine') }}</span>
                <span class="font-mono">{{ getTemperatureValue('rankine').toFixed(2) }}°R</span>
              </div>
            </div>
          </div>

          <div v-if="showAllConversions" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.unit-converter.page.allUnitsConversion') }}</h4>
            <div class="grid grid-cols-1 gap-2 text-sm max-h-48 overflow-y-auto">
              <div v-for="unit in currentUnits" :key="unit.id" class="flex justify-between items-center">
                <span>{{ getUnitDisplayName(unit.id) }}:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ formatNumber(convertToUnit(unit.id)) }} {{ unit.symbol }}</span>
                  <button @click="copyToClipboard(`${formatNumber(convertToUnit(unit.id))} ${unit.symbol}`)" class="px-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
                    {{ $t('tools.unit-converter.page.copyButton') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button @click="showAllConversions = !showAllConversions" class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">
            {{ showAllConversions ? $t('tools.unit-converter.page.hideAllConversions') : $t('tools.unit-converter.page.showAllConversions') }}
          </button>
        </div>

        <div v-if="result === null" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📏</div>
          <div class="text-lg mb-2">{{ $t('tools.unit-converter.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.unit-converter.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.unit-converter.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">{{ item.categoryName }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="font-mono">{{ item.inputValue }} {{ item.fromSymbol }} = {{ formatNumber(item.result) }} {{ item.toSymbol }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.unit-converter.page.load') }}</button>
            <button @click="copyToClipboard(`${formatNumber(item.result)} ${item.toSymbol}`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
              {{ $t('tools.unit-converter.page.copyResult') }}
            </button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.unit-converter.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.unit-converter.page.supportedTypesTitle') }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-200">
        <div v-for="category in categories" :key="category.id">
          <strong>{{ category.name }}:</strong> {{ category.units.length }} {{ $t('tools.unit-converter.page.unitsCount') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: number; // 转换到基础单位的倍数
  offset?: number; // 温度转换的偏移量
}

interface Category {
  id: string;
  name: string;
  baseUnit: string;
  units: Unit[];
}

interface HistoryItem {
  categoryId: string;
  categoryName: string;
  inputValue: number;
  fromUnit: string;
  toUnit: string;
  fromSymbol: string;
  toSymbol: string;
  result: number;
  timestamp: number;
}

const { t } = useI18n();

const selectedCategory = ref('length');
const inputValue = ref('');
const fromUnit = ref('');
const toUnit = ref('');
const result = ref<number | null>(null);
const showAllConversions = ref(false);
const history = ref<HistoryItem[]>([]);

const categories: Category[] = [
  {
    id: 'length',
    name: t('tools.unit-converter.page.categories.length'),
    baseUnit: 'meter',
    units: [
      { id: 'millimeter', name: t('tools.unit-converter.page.units.millimeter'), symbol: 'mm', toBase: 0.001 },
      { id: 'centimeter', name: t('tools.unit-converter.page.units.centimeter'), symbol: 'cm', toBase: 0.01 },
      { id: 'meter', name: t('tools.unit-converter.page.units.meter'), symbol: 'm', toBase: 1 },
      { id: 'kilometer', name: t('tools.unit-converter.page.units.kilometer'), symbol: 'km', toBase: 1000 },
      { id: 'inch', name: t('tools.unit-converter.page.units.inch'), symbol: 'in', toBase: 0.0254 },
      { id: 'foot', name: t('tools.unit-converter.page.units.foot'), symbol: 'ft', toBase: 0.3048 },
      { id: 'yard', name: t('tools.unit-converter.page.units.yard'), symbol: 'yd', toBase: 0.9144 },
      { id: 'mile', name: t('tools.unit-converter.page.units.mile'), symbol: 'mi', toBase: 1609.344 },
      { id: 'nautical_mile', name: t('tools.unit-converter.page.units.nautical_mile'), symbol: 'nmi', toBase: 1852 }
    ]
  },
  {
    id: 'weight',
    name: t('tools.unit-converter.page.categories.weight'),
    baseUnit: 'gram',
    units: [
      { id: 'milligram', name: t('tools.unit-converter.page.units.milligram'), symbol: 'mg', toBase: 0.001 },
      { id: 'gram', name: t('tools.unit-converter.page.units.gram'), symbol: 'g', toBase: 1 },
      { id: 'kilogram', name: t('tools.unit-converter.page.units.kilogram'), symbol: 'kg', toBase: 1000 },
      { id: 'ton', name: t('tools.unit-converter.page.units.ton'), symbol: 't', toBase: 1000000 },
      { id: 'ounce', name: t('tools.unit-converter.page.units.ounce'), symbol: 'oz', toBase: 28.3495 },
      { id: 'pound', name: t('tools.unit-converter.page.units.pound'), symbol: 'lb', toBase: 453.592 },
      { id: 'stone', name: t('tools.unit-converter.page.units.stone'), symbol: 'st', toBase: 6350.29 }
    ]
  },
  {
    id: 'temperature',
    name: t('tools.unit-converter.page.categories.temperature'),
    baseUnit: 'celsius',
    units: [
      { id: 'celsius', name: t('tools.unit-converter.page.units.celsius'), symbol: '°C', toBase: 1, offset: 0 },
      { id: 'fahrenheit', name: t('tools.unit-converter.page.units.fahrenheit'), symbol: '°F', toBase: 5 / 9, offset: -32 },
      { id: 'kelvin', name: t('tools.unit-converter.page.units.kelvin'), symbol: 'K', toBase: 1, offset: -273.15 },
      { id: 'rankine', name: t('tools.unit-converter.page.units.rankine'), symbol: '°R', toBase: 5 / 9, offset: -459.67 }
    ]
  },
  {
    id: 'area',
    name: t('tools.unit-converter.page.categories.area'),
    baseUnit: 'square_meter',
    units: [
      { id: 'square_millimeter', name: t('tools.unit-converter.page.units.square_millimeter'), symbol: 'mm²', toBase: 0.000001 },
      { id: 'square_centimeter', name: t('tools.unit-converter.page.units.square_centimeter'), symbol: 'cm²', toBase: 0.0001 },
      { id: 'square_meter', name: t('tools.unit-converter.page.units.square_meter'), symbol: 'm²', toBase: 1 },
      { id: 'square_kilometer', name: t('tools.unit-converter.page.units.square_kilometer'), symbol: 'km²', toBase: 1000000 },
      { id: 'hectare', name: t('tools.unit-converter.page.units.hectare'), symbol: 'ha', toBase: 10000 },
      { id: 'acre', name: t('tools.unit-converter.page.units.acre'), symbol: 'ac', toBase: 4046.86 },
      { id: 'square_inch', name: t('tools.unit-converter.page.units.square_inch'), symbol: 'in²', toBase: 0.00064516 },
      { id: 'square_foot', name: t('tools.unit-converter.page.units.square_foot'), symbol: 'ft²', toBase: 0.092903 }
    ]
  },
  {
    id: 'volume',
    name: t('tools.unit-converter.page.categories.volume'),
    baseUnit: 'liter',
    units: [
      { id: 'milliliter', name: t('tools.unit-converter.page.units.milliliter'), symbol: 'ml', toBase: 0.001 },
      { id: 'liter', name: t('tools.unit-converter.page.units.liter'), symbol: 'L', toBase: 1 },
      { id: 'cubic_meter', name: t('tools.unit-converter.page.units.cubic_meter'), symbol: 'm³', toBase: 1000 },
      { id: 'gallon_us', name: t('tools.unit-converter.page.units.gallon_us'), symbol: 'gal', toBase: 3.78541 },
      { id: 'gallon_uk', name: t('tools.unit-converter.page.units.gallon_uk'), symbol: 'gal', toBase: 4.54609 },
      { id: 'quart', name: t('tools.unit-converter.page.units.quart'), symbol: 'qt', toBase: 0.946353 },
      { id: 'pint', name: t('tools.unit-converter.page.units.pint'), symbol: 'pt', toBase: 0.473176 },
      { id: 'cup', name: t('tools.unit-converter.page.units.cup'), symbol: 'cup', toBase: 0.236588 },
      { id: 'fluid_ounce', name: t('tools.unit-converter.page.units.fluid_ounce'), symbol: 'fl oz', toBase: 0.0295735 }
    ]
  },
  {
    id: 'speed',
    name: t('tools.unit-converter.page.categories.speed'),
    baseUnit: 'meter_per_second',
    units: [
      { id: 'meter_per_second', name: t('tools.unit-converter.page.units.meter_per_second'), symbol: 'm/s', toBase: 1 },
      { id: 'kilometer_per_hour', name: t('tools.unit-converter.page.units.kilometer_per_hour'), symbol: 'km/h', toBase: 0.277778 },
      { id: 'mile_per_hour', name: t('tools.unit-converter.page.units.mile_per_hour'), symbol: 'mph', toBase: 0.44704 },
      { id: 'foot_per_second', name: t('tools.unit-converter.page.units.foot_per_second'), symbol: 'ft/s', toBase: 0.3048 },
      { id: 'knot', name: t('tools.unit-converter.page.units.knot'), symbol: 'kn', toBase: 0.514444 }
    ]
  }
];

const currentCategory = computed(() => {
  return categories.find((c) => c.id === selectedCategory.value);
});

const currentUnits = computed(() => {
  return currentCategory.value?.units || [];
});

function resetValues() {
  inputValue.value = '';
  fromUnit.value = '';
  toUnit.value = '';
  result.value = null;

  // 设置默认单位
  if (currentUnits.value.length > 0) {
    fromUnit.value = currentUnits.value[0].id;
    toUnit.value = currentUnits.value.length > 1 ? currentUnits.value[1].id : currentUnits.value[0].id;
  }
}

function convert() {
  if (!inputValue.value || !fromUnit.value || !toUnit.value) {
    result.value = null;
    return;
  }

  const input = parseFloat(inputValue.value);
  if (isNaN(input)) {
    result.value = null;
    return;
  }

  if (selectedCategory.value === 'temperature') {
    result.value = convertTemperature(input, fromUnit.value, toUnit.value);
  } else {
    const fromUnitInfo = getUnitInfo(fromUnit.value);
    const toUnitInfo = getUnitInfo(toUnit.value);

    if (!fromUnitInfo || !toUnitInfo) {
      result.value = null;
      return;
    }

    // 转换到基础单位，再转换到目标单位
    const baseValue = input * fromUnitInfo.toBase;
    result.value = baseValue / toUnitInfo.toBase;
  }
}

function convertTemperature(value: number, from: string, to: string): number {
  // 先转换到摄氏度
  let celsius: number;

  switch (from) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = ((value - 32) * 5) / 9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    case 'rankine':
      celsius = ((value - 459.67) * 5) / 9;
      break;
    default:
      celsius = value;
  }

  // 从摄氏度转换到目标单位
  switch (to) {
    case 'celsius':
      return celsius;
    case 'fahrenheit':
      return (celsius * 9) / 5 + 32;
    case 'kelvin':
      return celsius + 273.15;
    case 'rankine':
      return (celsius * 9) / 5 + 459.67;
    default:
      return celsius;
  }
}

function convertToUnit(unitId: string): number {
  if (!inputValue.value || !fromUnit.value) return 0;

  const input = parseFloat(inputValue.value);
  if (isNaN(input)) return 0;

  if (selectedCategory.value === 'temperature') {
    return convertTemperature(input, fromUnit.value, unitId);
  } else {
    const fromUnitInfo = getUnitInfo(fromUnit.value);
    const toUnitInfo = getUnitInfo(unitId);

    if (!fromUnitInfo || !toUnitInfo) return 0;

    const baseValue = input * fromUnitInfo.toBase;
    return baseValue / toUnitInfo.toBase;
  }
}

function getTemperatureValue(unitId: string): number {
  if (!inputValue.value || !fromUnit.value) return 0;

  const input = parseFloat(inputValue.value);
  if (isNaN(input)) return 0;

  return convertTemperature(input, fromUnit.value, unitId);
}

function getUnitInfo(unitId: string): Unit | undefined {
  return currentUnits.value.find((u) => u.id === unitId);
}

function getUnitDisplayName(unitId: string): string {
  return t(`tools.unit-converter.page.units.${unitId}`);
}

function getConversionFormula(): string {
  if (!fromUnit.value || !toUnit.value) return '';

  const fromUnitInfo = getUnitInfo(fromUnit.value);
  const toUnitInfo = getUnitInfo(toUnit.value);

  if (!fromUnitInfo || !toUnitInfo) return '';

  if (selectedCategory.value === 'temperature') {
    return getTemperatureFormula(fromUnit.value, toUnit.value);
  } else {
    const factor = fromUnitInfo.toBase / toUnitInfo.toBase;
    return `1 ${fromUnitInfo.symbol} = ${formatNumber(factor)} ${toUnitInfo.symbol}`;
  }
}

function getTemperatureFormula(from: string, to: string): string {
  const formulas: Record<string, Record<string, string>> = {
    celsius: {
      fahrenheit: '°F = °C × 9/5 + 32',
      kelvin: 'K = °C + 273.15',
      rankine: '°R = °C × 9/5 + 459.67'
    },
    fahrenheit: {
      celsius: '°C = (°F - 32) × 5/9',
      kelvin: 'K = (°F - 32) × 5/9 + 273.15',
      rankine: '°R = °F + 459.67'
    },
    kelvin: {
      celsius: '°C = K - 273.15',
      fahrenheit: '°F = (K - 273.15) × 9/5 + 32',
      rankine: '°R = K × 9/5'
    },
    rankine: {
      celsius: '°C = (°R - 459.67) × 5/9',
      fahrenheit: '°F = °R - 459.67',
      kelvin: 'K = °R × 5/9'
    }
  };

  return formulas[from]?.[to] || `${from} → ${to}`;
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 0.001 && num !== 0)) {
    return num.toExponential(6);
  } else if (Math.abs(num) < 1) {
    return num.toFixed(8).replace(/\.?0+$/, '');
  } else {
    return num.toFixed(6).replace(/\.?0+$/, '');
  }
}

function swapUnits() {
  const temp = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = temp;
  convert();
}

function clearAll() {
  inputValue.value = '';
  result.value = null;
}

function copyResult() {
  if (result.value !== null) {
    const toUnitInfo = getUnitInfo(toUnit.value);
    const text = `${formatNumber(result.value)} ${toUnitInfo?.symbol || ''}`;
    copyToClipboard(text);
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert(t('tools.unit-converter.page.copied'));
  });
}

function saveToHistory() {
  if (result.value === null || !inputValue.value || !fromUnit.value || !toUnit.value) return;

  const fromUnitInfo = getUnitInfo(fromUnit.value);
  const toUnitInfo = getUnitInfo(toUnit.value);

  if (!fromUnitInfo || !toUnitInfo || !currentCategory.value) return;

  const item: HistoryItem = {
    categoryId: selectedCategory.value,
    categoryName: currentCategory.value.name,
    inputValue: parseFloat(inputValue.value),
    fromUnit: fromUnit.value,
    toUnit: toUnit.value,
    fromSymbol: fromUnitInfo.symbol,
    toSymbol: toUnitInfo.symbol,
    result: result.value,
    timestamp: Date.now()
  };

  history.value.unshift(item);

  // 只保留最近20条
  if (history.value.length > 20) {
    history.value = history.value.slice(0, 20);
  }

  saveHistoryToStorage();
}

function loadFromHistory(item: HistoryItem) {
  selectedCategory.value = item.categoryId;
  inputValue.value = item.inputValue.toString();
  fromUnit.value = item.fromUnit;
  toUnit.value = item.toUnit;
  convert();
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  saveHistoryToStorage();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function saveHistoryToStorage() {
  localStorage.setItem('unit-converter-history', JSON.stringify(history.value));
}

function loadHistoryFromStorage() {
  const saved = localStorage.getItem('unit-converter-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch (error) {
      console.error(t('tools.unit-converter.page.loadHistoryFailed'), error);
    }
  }
}

onMounted(() => {
  resetValues();
  loadHistoryFromStorage();
});
</script>
