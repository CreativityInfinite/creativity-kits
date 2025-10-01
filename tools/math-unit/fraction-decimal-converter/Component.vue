<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.fraction-decimal-converter.page.title') }}</h3>

        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.fraction-decimal-converter.page.decToFrac') }}</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.fraction-decimal-converter.page.inputDecimal') }}</label>
                <input
                  v-model="decimalInput"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  :placeholder="$t('tools.fraction-decimal-converter.page.decimalPlaceholder')"
                  @input="convertDecimalToFraction"
                />
                <p class="text-xs text-gray-500 mt-1">{{ $t('tools.fraction-decimal-converter.page.supportNote') }}</p>
              </div>

              <div v-if="decimalResult.isValid" class="space-y-2">
                <div class="bg-white dark:bg-gray-700 rounded-lg p-3 border">
                  <div class="text-center">
                    <div class="text-2xl font-mono">
                      <span class="text-blue-600">{{ decimalResult.numerator }}</span>
                      <span class="mx-2">/</span>
                      <span class="text-green-600">{{ decimalResult.denominator }}</span>
                    </div>
                    <div v-if="decimalResult.wholeNumber" class="text-lg text-gray-600 mt-1">= {{ decimalResult.wholeNumber }} {{ decimalResult.properNumerator }}/{{ decimalResult.denominator }}</div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                    <div class="font-medium text-blue-800 dark:text-blue-200">{{ $t('tools.fraction-decimal-converter.page.simplestFraction') }}</div>
                    <div class="font-mono">{{ decimalResult.simplified }}</div>
                  </div>
                  <div class="bg-green-50 dark:bg-green-900/20 rounded p-2">
                    <div class="font-medium text-green-800 dark:text-green-200">{{ $t('tools.fraction-decimal-converter.page.verification') }}</div>
                    <div class="font-mono">{{ decimalResult.verification }}</div>
                  </div>
                </div>
              </div>

              <div v-if="decimalError" class="text-red-500 text-sm">
                {{ decimalError }}
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.fraction-decimal-converter.page.fracToDec') }}</h4>
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.fraction-decimal-converter.page.wholeLabel') }}</label>
                  <input
                    v-model="wholeNumber"
                    type="number"
                    class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0"
                    @input="convertFractionToDecimal"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.fraction-decimal-converter.page.numeratorLabel') }}</label>
                  <input
                    v-model="numerator"
                    type="number"
                    class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="1"
                    @input="convertFractionToDecimal"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.fraction-decimal-converter.page.denominatorLabel') }}</label>
                  <input
                    v-model="denominator"
                    type="number"
                    class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="2"
                    @input="convertFractionToDecimal"
                  />
                </div>
              </div>

              <div v-if="fractionResult.isValid" class="space-y-2">
                <div class="bg-white dark:bg-gray-700 rounded-lg p-3 border">
                  <div class="text-center">
                    <div class="text-2xl font-mono text-blue-600">
                      {{ fractionResult.decimal }}
                    </div>
                    <div v-if="fractionResult.isRepeating" class="text-sm text-gray-600 mt-1">
                      {{ $t('tools.fraction-decimal-converter.page.repeatingDecimal') }}: {{ fractionResult.repeatingDecimal }}
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                    <div class="font-medium text-purple-800 dark:text-purple-200">{{ $t('tools.fraction-decimal-converter.page.typeLabel') }}</div>
                    <div>{{ fractionResult.type }}</div>
                  </div>
                  <div class="bg-orange-50 dark:bg-orange-900/20 rounded p-2">
                    <div class="font-medium text-orange-800 dark:text-orange-200">{{ $t('tools.fraction-decimal-converter.page.precisionLabel') }}</div>
                    <div>{{ fractionResult.precision }} {{ $t('tools.fraction-decimal-converter.page.decimalsSuffix') }}</div>
                  </div>
                </div>
              </div>

              <div v-if="fractionError" class="text-red-500 text-sm">
                {{ fractionError }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.fraction-decimal-converter.page.historyTitle') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <div class="flex justify-between items-center">
              <span class="font-medium text-sm">{{ $t('tools.fraction-decimal-converter.page.historyListTitle') }}</span>
              <button @click="clearHistory" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">{{ $t('tools.fraction-decimal-converter.page.clearHistory') }}</button>
            </div>
          </div>

          <div class="max-h-96 overflow-y-auto">
            <div v-for="(record, index) in history" :key="index" class="p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="font-mono text-sm">{{ record.input }} → {{ record.output }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ record.type }} | {{ record.timestamp }}</div>
                </div>
                <button @click="useHistoryRecord(record)" class="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.fraction-decimal-converter.page.use') }}</button>
              </div>
            </div>

            <div v-if="history.length === 0" class="p-8 text-center text-gray-500">
              <div class="text-2xl mb-2">📊</div>
              <div>{{ $t('tools.fraction-decimal-converter.page.noHistory') }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.fraction-decimal-converter.page.commonFractions') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="common in commonFractions"
              :key="common.fraction"
              @click="loadCommonFraction(common)"
              class="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm"
            >
              <div class="font-mono">{{ common.fraction }}</div>
              <div class="text-xs">{{ common.decimal }}</div>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.fraction-decimal-converter.page.batchTitle') }}</h4>
          <div class="space-y-3">
            <textarea
              v-model="batchInput"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              rows="4"
              :placeholder="$t('tools.fraction-decimal-converter.page.batchPlaceholder')"
            />
            <div class="flex gap-2">
              <button @click="processBatch" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.fraction-decimal-converter.page.batchConvert') }}</button>
              <button @click="exportBatch" :disabled="batchResults.length === 0" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
                {{ $t('tools.fraction-decimal-converter.page.exportResults') }}
              </button>
            </div>

            <div v-if="batchResults.length > 0" class="bg-white dark:bg-gray-700 rounded border p-3">
              <h5 class="font-medium mb-2">{{ $t('tools.fraction-decimal-converter.page.batchResultsTitle') }}</h5>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <div v-for="(result, index) in batchResults" :key="index" class="text-sm font-mono">{{ result.input }} → {{ result.output }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.fraction-decimal-converter.page.usageTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.fraction-decimal-converter.page.usageDecToFracTitle') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.fraction-decimal-converter.page.usageDecLine1') }}</li>
            <li>{{ $t('tools.fraction-decimal-converter.page.usageDecLine2') }}</li>
            <li>{{ $t('tools.fraction-decimal-converter.page.usageDecLine3') }}</li>
            <li>{{ $t('tools.fraction-decimal-converter.page.usageDecLine4') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.fraction-decimal-converter.page.usageFracToDecTitle') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.fraction-decimal-converter.page.usageFracLine1') }}</li>
            <li>{{ $t('tools.fraction-decimal-converter.page.usageFracLine2') }}</li>
            <li>{{ $t('tools.fraction-decimal-converter.page.usageFracLine3') }}</li>
            <li>{{ $t('tools.fraction-decimal-converter.page.usageFracLine4') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface DecimalResult {
  isValid: boolean;
  numerator: number;
  denominator: number;
  wholeNumber?: number;
  properNumerator?: number;
  simplified: string;
  verification: string;
}

interface FractionResult {
  isValid: boolean;
  decimal: string;
  type: string;
  precision: number;
  isRepeating: boolean;
  repeatingDecimal?: string;
}

interface ConversionRecord {
  input: string;
  output: string;
  type: string;
  timestamp: string;
}

interface CommonFraction {
  fraction: string;
  decimal: string;
  numerator: number;
  denominator: number;
}

const decimalInput = ref('');
const numerator = ref('');
const denominator = ref('');
const wholeNumber = ref('');
const batchInput = ref('');

const decimalError = ref('');
const fractionError = ref('');
const history = ref<ConversionRecord[]>([]);
const batchResults = ref<ConversionRecord[]>([]);

const commonFractions: CommonFraction[] = [
  { fraction: '1/2', decimal: '0.5', numerator: 1, denominator: 2 },
  { fraction: '1/3', decimal: '0.333...', numerator: 1, denominator: 3 },
  { fraction: '1/4', decimal: '0.25', numerator: 1, denominator: 4 },
  { fraction: '1/5', decimal: '0.2', numerator: 1, denominator: 5 },
  { fraction: '1/6', decimal: '0.1666...', numerator: 1, denominator: 6 },
  { fraction: '1/8', decimal: '0.125', numerator: 1, denominator: 8 },
  { fraction: '2/3', decimal: '0.666...', numerator: 2, denominator: 3 },
  { fraction: '3/4', decimal: '0.75', numerator: 3, denominator: 4 },
  { fraction: '3/8', decimal: '0.375', numerator: 3, denominator: 8 },
  { fraction: '5/8', decimal: '0.625', numerator: 5, denominator: 8 },
  { fraction: '7/8', decimal: '0.875', numerator: 7, denominator: 8 },
  { fraction: '5/6', decimal: '0.8333...', numerator: 5, denominator: 6 }
];

const decimalResult = computed((): DecimalResult => {
  if (!decimalInput.value) {
    return { isValid: false, numerator: 0, denominator: 1, simplified: '', verification: '' };
  }

  try {
    const result = decimalToFraction(decimalInput.value);
    return result;
  } catch (error) {
    return { isValid: false, numerator: 0, denominator: 1, simplified: '', verification: '' };
  }
});

const fractionResult = computed((): FractionResult => {
  const num = parseInt(numerator.value) || 0;
  const den = parseInt(denominator.value) || 1;
  const whole = parseInt(wholeNumber.value) || 0;

  if (den === 0) {
    return { isValid: false, decimal: '', type: '', precision: 0, isRepeating: false };
  }

  try {
    const result = fractionToDecimal(whole, num, den);
    return result;
  } catch (error) {
    return { isValid: false, decimal: '', type: '', precision: 0, isRepeating: false };
  }
});

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function decimalToFraction(decimal: string): DecimalResult {
  // 清理输入
  decimal = decimal.trim().replace(/,/g, '');

  // 检查是否为有效数字
  if (!/^-?\d*\.?\d+$/.test(decimal)) {
    throw new Error(t('tools.fraction-decimal-converter.page.errInvalidDecimalFormat'));
  }

  const num = parseFloat(decimal);
  if (isNaN(num)) {
    throw new Error(t('tools.fraction-decimal-converter.page.errInvalidNumber'));
  }

  // 处理整数
  if (Number.isInteger(num)) {
    return {
      isValid: true,
      numerator: Math.abs(num),
      denominator: 1,
      simplified: `${Math.abs(num)}/1`,
      verification: num.toString()
    };
  }

  // 分离整数和小数部分
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const wholePart = Math.floor(absNum);
  const decimalPart = absNum - wholePart;

  // 转换小数部分为分数
  const decimalStr = decimalPart.toString();
  const decimalPlaces = decimalStr.split('.')[1]?.length || 0;

  let numerator = Math.round(decimalPart * Math.pow(10, decimalPlaces));
  let denominator = Math.pow(10, decimalPlaces);

  // 化简分数
  const commonDivisor = gcd(numerator, denominator);
  numerator = numerator / commonDivisor;
  denominator = denominator / commonDivisor;

  // 如果有整数部分，转换为假分数
  if (wholePart > 0) {
    numerator = wholePart * denominator + numerator;
  }

  if (isNegative) {
    numerator = -numerator;
  }

  // 计算带分数形式
  let wholeNumber: number | undefined;
  let properNumerator: number | undefined;

  if (Math.abs(numerator) > denominator) {
    wholeNumber = Math.floor(Math.abs(numerator) / denominator);
    properNumerator = Math.abs(numerator) % denominator;
    if (isNegative) wholeNumber = -wholeNumber;
  }

  const verification = (numerator / denominator).toString();
  const simplified = `${Math.abs(numerator)}/${denominator}`;

  return {
    isValid: true,
    numerator: Math.abs(numerator),
    denominator,
    wholeNumber,
    properNumerator,
    simplified,
    verification
  };
}

function fractionToDecimal(whole: number, num: number, den: number): FractionResult {
  if (den === 0) {
    throw new Error(t('tools.fraction-decimal-converter.page.errDenominatorZero'));
  }

  // 计算总的分子
  const totalNumerator = whole * den + num;

  // 执行长除法
  const result = longDivision(totalNumerator, den);

  return result;
}

function longDivision(numerator: number, denominator: number): FractionResult {
  const isNegative = numerator < 0 !== denominator < 0;
  numerator = Math.abs(numerator);
  denominator = Math.abs(denominator);

  const wholePart = Math.floor(numerator / denominator);
  let remainder = numerator % denominator;

  if (remainder === 0) {
    const decimal = isNegative ? `-${wholePart}` : wholePart.toString();
    return {
      isValid: true,
      decimal,
      type: t('tools.fraction-decimal-converter.page.typeFinite'),
      precision: 0,
      isRepeating: false
    };
  }

  const decimalParts: string[] = [];
  const remainders: number[] = [];
  let repeatingStart = -1;

  while (remainder !== 0) {
    if (remainders.includes(remainder)) {
      repeatingStart = remainders.indexOf(remainder);
      break;
    }

    remainders.push(remainder);
    remainder *= 10;
    const digit = Math.floor(remainder / denominator);
    decimalParts.push(digit.toString());
    remainder = remainder % denominator;
  }

  let decimalStr = decimalParts.join('');
  let type = t('tools.fraction-decimal-converter.page.typeFinite');
  let repeatingDecimal: string | undefined;

  if (repeatingStart !== -1) {
    type = t('tools.fraction-decimal-converter.page.typeRepeating');
    const nonRepeating = decimalParts.slice(0, repeatingStart).join('');
    const repeating = decimalParts.slice(repeatingStart).join('');
    decimalStr = nonRepeating + repeating;
    repeatingDecimal = `${wholePart}.${nonRepeating}(${repeating})`;
  }

  const decimal = `${isNegative ? '-' : ''}${wholePart}.${decimalStr}`;

  return {
    isValid: true,
    decimal: decimal.length > 20 ? decimal.substring(0, 20) + '...' : decimal,
    type,
    precision: decimalParts.length,
    isRepeating: repeatingStart !== -1,
    repeatingDecimal
  };
}

function convertDecimalToFraction() {
  decimalError.value = '';

  if (!decimalInput.value) return;

  try {
    const result = decimalToFraction(decimalInput.value);
    if (result.isValid) {
      addToHistory(decimalInput.value, result.simplified, t('tools.fraction-decimal-converter.page.opDecToFrac'));
    }
  } catch (error) {
    decimalError.value = (error as Error).message;
  }
}

function convertFractionToDecimal() {
  fractionError.value = '';

  const num = parseInt(numerator.value) || 0;
  const den = parseInt(denominator.value) || 1;
  const whole = parseInt(wholeNumber.value) || 0;

  if (den === 0) {
    fractionError.value = t('tools.fraction-decimal-converter.page.errDenominatorZero');
    return;
  }

  try {
    const result = fractionToDecimal(whole, num, den);
    if (result.isValid) {
      const fractionStr = whole > 0 ? `${whole} ${num}/${den}` : `${num}/${den}`;
      addToHistory(fractionStr, result.decimal, t('tools.fraction-decimal-converter.page.opFracToDec'));
    }
  } catch (error) {
    fractionError.value = (error as Error).message;
  }
}

function addToHistory(input: string, output: string, type: string) {
  history.value.unshift({
    input,
    output,
    type,
    timestamp: new Date().toLocaleTimeString('zh-CN')
  });

  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value = history.value.slice(0, 50);
  }
}

function clearHistory() {
  history.value = [];
}

function useHistoryRecord(record: ConversionRecord) {
  if (record.type === t('tools.fraction-decimal-converter.page.opDecToFrac')) {
    decimalInput.value = record.input;
    convertDecimalToFraction();
  } else {
    // 解析分数格式
    const parts = record.input.split(' ');
    if (parts.length === 2) {
      wholeNumber.value = parts[0];
      const fraction = parts[1].split('/');
      numerator.value = fraction[0];
      denominator.value = fraction[1];
    } else {
      const fraction = record.input.split('/');
      wholeNumber.value = '0';
      numerator.value = fraction[0];
      denominator.value = fraction[1];
    }
    convertFractionToDecimal();
  }
}

function loadCommonFraction(common: CommonFraction) {
  wholeNumber.value = '0';
  numerator.value = common.numerator.toString();
  denominator.value = common.denominator.toString();
  convertFractionToDecimal();
}

function processBatch() {
  batchResults.value = [];

  const lines = batchInput.value.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    const input = line.trim();

    try {
      if (input.includes('/')) {
        // 分数转小数
        const parts = input.split(' ');
        let whole = 0;
        let fraction = input;

        if (parts.length === 2) {
          whole = parseInt(parts[0]);
          fraction = parts[1];
        }

        const [num, den] = fraction.split('/').map((x) => parseInt(x));
        const result = fractionToDecimal(whole, num, den);

        batchResults.value.push({
          input,
          output: result.decimal,
          type: t('tools.fraction-decimal-converter.page.opFracToDec'),
          timestamp: new Date().toLocaleTimeString('zh-CN')
        });
      } else {
        // 小数转分数
        const result = decimalToFraction(input);

        batchResults.value.push({
          input,
          output: result.simplified,
          type: t('tools.fraction-decimal-converter.page.opDecToFrac'),
          timestamp: new Date().toLocaleTimeString('zh-CN')
        });
      }
    } catch (error) {
      batchResults.value.push({
        input,
        output: t('tools.fraction-decimal-converter.page.batchConvertFailedPrefix') + (error as Error).message,
        type: t('tools.fraction-decimal-converter.page.errorLabel'),
        timestamp: new Date().toLocaleTimeString('zh-CN')
      });
    }
  }
}

function exportBatch() {
  const report = `${t('tools.fraction-decimal-converter.page.reportTitle')}
${t('tools.fraction-decimal-converter.page.reportTime')}: ${new Date().toLocaleString('zh-CN')}
${t('tools.fraction-decimal-converter.page.reportCount')}: ${batchResults.value.length}

${t('tools.fraction-decimal-converter.page.reportResults')}:
${batchResults.value
  .map((result, index) => {
    return `${index + 1}. ${result.input} → ${result.output} (${result.type})`;
  })
  .join('\n')}

${t('tools.fraction-decimal-converter.page.reportGeneratedAt')}: ${new Date().toLocaleString('zh-CN')}
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fraction-decimal-conversion-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
