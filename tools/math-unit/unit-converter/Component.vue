<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">单位转换</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">转换类型</label>
            <select v-model="selectedCategory" @change="resetValues" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">输入数值</label>
            <input
              v-model="inputValue"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="输入要转换的数值"
              @input="convert"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">从单位</label>
            <select v-model="fromUnit" @change="convert" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.symbol }})</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">到单位</label>
            <select v-model="toUnit" @change="convert" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">{{ unit.name }} ({{ unit.symbol }})</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button @click="swapUnits" :disabled="!fromUnit || !toUnit" class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换单位</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">转换结果</h3>

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
                <span class="text-gray-600 dark:text-gray-400">转换公式:</span>
                <span class="font-mono">{{ getConversionFormula() }}</span>
              </div>
            </div>

            <div class="mt-3 flex gap-2">
              <button @click="copyResult" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">复制结果</button>
              <button @click="saveToHistory" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">保存记录</button>
            </div>
          </div>

          <div v-if="selectedCategory === 'temperature'" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">温度对照表</h4>
            <div class="grid grid-cols-1 gap-2 text-sm">
              <div class="flex justify-between">
                <span>摄氏度 (°C):</span>
                <span class="font-mono">{{ getTemperatureValue('celsius').toFixed(2) }}°C</span>
              </div>
              <div class="flex justify-between">
                <span>华氏度 (°F):</span>
                <span class="font-mono">{{ getTemperatureValue('fahrenheit').toFixed(2) }}°F</span>
              </div>
              <div class="flex justify-between">
                <span>开尔文 (K):</span>
                <span class="font-mono">{{ getTemperatureValue('kelvin').toFixed(2) }}K</span>
              </div>
              <div class="flex justify-between">
                <span>兰氏度 (°R):</span>
                <span class="font-mono">{{ getTemperatureValue('rankine').toFixed(2) }}°R</span>
              </div>
            </div>
          </div>

          <div v-if="showAllConversions" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">所有单位转换</h4>
            <div class="grid grid-cols-1 gap-2 text-sm max-h-48 overflow-y-auto">
              <div v-for="unit in currentUnits" :key="unit.id" class="flex justify-between items-center">
                <span>{{ unit.name }}:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ formatNumber(convertToUnit(unit.id)) }} {{ unit.symbol }}</span>
                  <button @click="copyToClipboard(`${formatNumber(convertToUnit(unit.id))} ${unit.symbol}`)" class="px-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
            </div>
          </div>

          <button @click="showAllConversions = !showAllConversions" class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">
            {{ showAllConversions ? '隐藏' : '显示' }}所有单位转换
          </button>
        </div>

        <div v-if="result === null" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📏</div>
          <div class="text-lg mb-2">单位转换器</div>
          <div class="text-sm">输入数值进行单位转换</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">转换历史</h3>
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
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyToClipboard(`${formatNumber(item.result)} ${item.toSymbol}`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制结果</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">支持的转换类型</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-200">
        <div v-for="category in categories" :key="category.id">
          <strong>{{ category.name }}:</strong> {{ category.units.length }} 个单位
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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
    name: '长度',
    baseUnit: 'meter',
    units: [
      { id: 'millimeter', name: '毫米', symbol: 'mm', toBase: 0.001 },
      { id: 'centimeter', name: '厘米', symbol: 'cm', toBase: 0.01 },
      { id: 'meter', name: '米', symbol: 'm', toBase: 1 },
      { id: 'kilometer', name: '千米', symbol: 'km', toBase: 1000 },
      { id: 'inch', name: '英寸', symbol: 'in', toBase: 0.0254 },
      { id: 'foot', name: '英尺', symbol: 'ft', toBase: 0.3048 },
      { id: 'yard', name: '码', symbol: 'yd', toBase: 0.9144 },
      { id: 'mile', name: '英里', symbol: 'mi', toBase: 1609.344 },
      { id: 'nautical_mile', name: '海里', symbol: 'nmi', toBase: 1852 }
    ]
  },
  {
    id: 'weight',
    name: '重量',
    baseUnit: 'gram',
    units: [
      { id: 'milligram', name: '毫克', symbol: 'mg', toBase: 0.001 },
      { id: 'gram', name: '克', symbol: 'g', toBase: 1 },
      { id: 'kilogram', name: '千克', symbol: 'kg', toBase: 1000 },
      { id: 'ton', name: '吨', symbol: 't', toBase: 1000000 },
      { id: 'ounce', name: '盎司', symbol: 'oz', toBase: 28.3495 },
      { id: 'pound', name: '磅', symbol: 'lb', toBase: 453.592 },
      { id: 'stone', name: '英石', symbol: 'st', toBase: 6350.29 }
    ]
  },
  {
    id: 'temperature',
    name: '温度',
    baseUnit: 'celsius',
    units: [
      { id: 'celsius', name: '摄氏度', symbol: '°C', toBase: 1, offset: 0 },
      { id: 'fahrenheit', name: '华氏度', symbol: '°F', toBase: 5 / 9, offset: -32 },
      { id: 'kelvin', name: '开尔文', symbol: 'K', toBase: 1, offset: -273.15 },
      { id: 'rankine', name: '兰氏度', symbol: '°R', toBase: 5 / 9, offset: -459.67 }
    ]
  },
  {
    id: 'area',
    name: '面积',
    baseUnit: 'square_meter',
    units: [
      { id: 'square_millimeter', name: '平方毫米', symbol: 'mm²', toBase: 0.000001 },
      { id: 'square_centimeter', name: '平方厘米', symbol: 'cm²', toBase: 0.0001 },
      { id: 'square_meter', name: '平方米', symbol: 'm²', toBase: 1 },
      { id: 'square_kilometer', name: '平方千米', symbol: 'km²', toBase: 1000000 },
      { id: 'hectare', name: '公顷', symbol: 'ha', toBase: 10000 },
      { id: 'acre', name: '英亩', symbol: 'ac', toBase: 4046.86 },
      { id: 'square_inch', name: '平方英寸', symbol: 'in²', toBase: 0.00064516 },
      { id: 'square_foot', name: '平方英尺', symbol: 'ft²', toBase: 0.092903 }
    ]
  },
  {
    id: 'volume',
    name: '体积',
    baseUnit: 'liter',
    units: [
      { id: 'milliliter', name: '毫升', symbol: 'ml', toBase: 0.001 },
      { id: 'liter', name: '升', symbol: 'L', toBase: 1 },
      { id: 'cubic_meter', name: '立方米', symbol: 'm³', toBase: 1000 },
      { id: 'gallon_us', name: '美制加仑', symbol: 'gal', toBase: 3.78541 },
      { id: 'gallon_uk', name: '英制加仑', symbol: 'gal', toBase: 4.54609 },
      { id: 'quart', name: '夸脱', symbol: 'qt', toBase: 0.946353 },
      { id: 'pint', name: '品脱', symbol: 'pt', toBase: 0.473176 },
      { id: 'cup', name: '杯', symbol: 'cup', toBase: 0.236588 },
      { id: 'fluid_ounce', name: '液体盎司', symbol: 'fl oz', toBase: 0.0295735 }
    ]
  },
  {
    id: 'speed',
    name: '速度',
    baseUnit: 'meter_per_second',
    units: [
      { id: 'meter_per_second', name: '米/秒', symbol: 'm/s', toBase: 1 },
      { id: 'kilometer_per_hour', name: '千米/小时', symbol: 'km/h', toBase: 0.277778 },
      { id: 'mile_per_hour', name: '英里/小时', symbol: 'mph', toBase: 0.44704 },
      { id: 'foot_per_second', name: '英尺/秒', symbol: 'ft/s', toBase: 0.3048 },
      { id: 'knot', name: '节', symbol: 'kn', toBase: 0.514444 }
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
    alert('已复制到剪贴板');
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
      console.error('加载历史记录失败:', error);
    }
  }
}

onMounted(() => {
  resetValues();
  loadHistoryFromStorage();
});
</script>
