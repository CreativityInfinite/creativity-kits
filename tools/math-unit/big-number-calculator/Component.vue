<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.big-number-calculator.page.title') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.big-number-calculator.page.numberA') }}</label>
            <textarea
              v-model="numberA"
              rows="3"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              :placeholder="$t('tools.big-number-calculator.page.placeholderA')"
            />
            <div class="text-xs text-gray-500 mt-1">{{ $t('tools.big-number-calculator.page.lengthN', { n: numberA.length }) }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.big-number-calculator.page.operator') }}</label>
            <select v-model="operator" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="+">{{ $t('tools.big-number-calculator.page.opAdd') }}</option>
              <option value="-">{{ $t('tools.big-number-calculator.page.opSubtract') }}</option>
              <option value="*">{{ $t('tools.big-number-calculator.page.opMultiply') }}</option>
              <option value="/">{{ $t('tools.big-number-calculator.page.opDivide') }}</option>
              <option value="%">{{ $t('tools.big-number-calculator.page.opMod') }}</option>
              <option value="**">{{ $t('tools.big-number-calculator.page.opPower') }}</option>
              <option value="gcd">{{ $t('tools.big-number-calculator.page.opGcd') }}</option>
              <option value="lcm">{{ $t('tools.big-number-calculator.page.opLcm') }}</option>
            </select>
          </div>

          <div v-if="needsSecondNumber">
            <label class="block text-sm font-medium mb-2">{{ $t('tools.big-number-calculator.page.numberB') }}</label>
            <textarea
              v-model="numberB"
              rows="3"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              :placeholder="$t('tools.big-number-calculator.page.placeholderB')"
            />
            <div class="text-xs text-gray-500 mt-1">{{ $t('tools.big-number-calculator.page.lengthN', { n: numberB.length }) }}</div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="calculate" :disabled="!canCalculate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              🧮 {{ $t('tools.big-number-calculator.page.calculate') }}
            </button>
            <button @click="clear" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">🗑️ {{ $t('tools.big-number-calculator.page.clear') }}</button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="loadExample" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm">📝 {{ $t('tools.big-number-calculator.page.example') }}</button>
            <button @click="swapNumbers" :disabled="!numberA || !numberB" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-md text-sm">
              🔄 {{ $t('tools.big-number-calculator.page.swap') }}
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.big-number-calculator.page.unaryOps') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="factorial" :disabled="!numberA || !isValidForFactorial" class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
              {{ $t('tools.big-number-calculator.page.opFactorial') }}
            </button>
            <button @click="isPrime" :disabled="!numberA" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded text-sm">
              {{ $t('tools.big-number-calculator.page.opPrimeCheck') }}
            </button>
            <button @click="fibonacci" :disabled="!numberA || !isValidForFibonacci" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white rounded text-sm">
              {{ $t('tools.big-number-calculator.page.opFibonacci') }}
            </button>
            <button @click="digitSum" :disabled="!numberA" class="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded text-sm">
              {{ $t('tools.big-number-calculator.page.opDigitSum') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.big-number-calculator.page.resultTitle') }}</h3>

        <div v-if="result" class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="space-y-4">
            <div>
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium">{{ $t('tools.big-number-calculator.page.result') }}</h4>
                <button @click="() => copyResult()" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">📋 {{ $t('tools.big-number-calculator.page.copy') }}</button>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm break-all">
                {{ result.value }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ $t('tools.big-number-calculator.page.lengthN', { n: result.value.length }) }}
                <span v-if="result.executionTime"> | {{ $t('tools.big-number-calculator.page.execTimeMs', { ms: result.executionTime }) }}</span>
              </div>
            </div>

            <div v-if="result.formatted" class="space-y-2">
              <h5 class="font-medium text-sm">{{ $t('tools.big-number-calculator.page.formattedTitle') }}</h5>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.withCommas') }}</span>
                  <span class="font-mono">{{ result.formatted.withCommas }}</span>
                </div>
                <div v-if="result.formatted.scientific" class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.scientific') }}</span>
                  <span class="font-mono">{{ result.formatted.scientific }}</span>
                </div>
                <div v-if="result.formatted.binary" class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.binary') }}</span>
                  <span class="font-mono text-xs break-all">{{ result.formatted.binary }}</span>
                </div>
                <div v-if="result.formatted.hex" class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.hex') }}</span>
                  <span class="font-mono">{{ result.formatted.hex }}</span>
                </div>
              </div>
            </div>

            <div v-if="result.properties" class="space-y-2">
              <h5 class="font-medium text-sm">{{ $t('tools.big-number-calculator.page.numberProps') }}</h5>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.parity') }}</span>
                  <span>{{ result.properties.isEven ? $t('tools.big-number-calculator.page.even') : $t('tools.big-number-calculator.page.odd') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.sign') }}</span>
                  <span>{{
                    result.properties.isPositive
                      ? $t('tools.big-number-calculator.page.positive')
                      : result.properties.isNegative
                        ? $t('tools.big-number-calculator.page.negative')
                        : $t('tools.big-number-calculator.page.zero')
                  }}</span>
                </div>
                <div v-if="result.properties.isPrime !== undefined" class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.prime') }}</span>
                  <span>{{ result.properties.isPrime ? $t('tools.big-number-calculator.page.yes') : $t('tools.big-number-calculator.page.no') }}</span>
                </div>
                <div v-if="result.properties.digitCount" class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.big-number-calculator.page.digitCount') }}</span>
                  <span>{{ result.properties.digitCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.big-number-calculator.page.calcError') }}</div>
              <div class="text-sm">{{ error }}</div>
            </div>
          </div>
        </div>

        <div v-if="!result && !error" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">🧮</div>
          <div class="text-lg mb-2">{{ $t('tools.big-number-calculator.page.title') }}</div>
          <div class="text-sm">{{ $t('tools.big-number-calculator.page.subtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">{{ $t('tools.big-number-calculator.page.historyTitle', { n: history.length }) }}</h4>
        <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.big-number-calculator.page.clearHistory') }}</button>
      </div>
      <div class="p-4">
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="(item, index) in history.slice(0, 10)" :key="index" class="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div class="font-mono text-sm break-all">{{ item.expression }}</div>
            <div class="font-mono text-xs text-gray-600 dark:text-gray-400 mt-1 break-all">= {{ item.result }}</div>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs text-gray-500">{{ formatTime(item.timestamp) }}</span>
              <div class="flex gap-1">
                <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.big-number-calculator.page.load') }}</button>
                <button @click="copyResult(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.big-number-calculator.page.copy') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.big-number-calculator.page.featureTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.big-number-calculator.page.supportedOps') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.big-number-calculator.page.featureBasic') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.featureAdvanced') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.featureNumberTheory') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.featureSpecial') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.featurePrimeAndProps') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.big-number-calculator.page.features') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.big-number-calculator.page.pointArbitraryPrecision') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.pointBases') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.pointScientific') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.pointHistory') }}</li>
            <li>{{ $t('tools.big-number-calculator.page.pointProps') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface CalculationResult {
  value: string;
  executionTime?: number;
  formatted?: {
    withCommas: string;
    scientific?: string;
    binary?: string;
    hex?: string;
  };
  properties?: {
    isEven: boolean;
    isPositive: boolean;
    isNegative: boolean;
    isPrime?: boolean;
    digitCount: number;
  };
}

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

const { t } = useI18n();

const numberA = ref('');
const numberB = ref('');
const operator = ref('+');
const result = ref<CalculationResult | null>(null);
const error = ref('');
const history = ref<HistoryItem[]>([]);

const needsSecondNumber = computed(() => {
  return !['factorial', 'isPrime', 'fibonacci', 'digitSum'].includes(operator.value);
});

const canCalculate = computed(() => {
  if (!numberA.value.trim()) return false;
  if (needsSecondNumber.value && !numberB.value.trim()) return false;
  return isValidNumber(numberA.value) && (!needsSecondNumber.value || isValidNumber(numberB.value));
});

const isValidForFactorial = computed(() => {
  if (!numberA.value) return false;
  const num = BigInt(numberA.value.replace(/[^\d-]/g, ''));
  return num >= 0n && num <= 1000n; // 限制阶乘范围
});

const isValidForFibonacci = computed(() => {
  if (!numberA.value) return false;
  const num = BigInt(numberA.value.replace(/[^\d-]/g, ''));
  return num >= 0n && num <= 10000n; // 限制斐波那契范围
});

// 验证数字格式
const isValidNumber = (str: string): boolean => {
  if (!str.trim()) return false;
  const cleaned = str.replace(/[,\s]/g, '');
  return /^-?\d+$/.test(cleaned);
};

// 清理数字字符串
const cleanNumber = (str: string): string => {
  return str.replace(/[,\s]/g, '');
};

// 大数运算函数
const calculate = () => {
  error.value = '';
  result.value = null;

  try {
    const startTime = performance.now();
    let resultValue: bigint;

    const a = BigInt(cleanNumber(numberA.value));
    const b = needsSecondNumber.value ? BigInt(cleanNumber(numberB.value)) : 0n;

    switch (operator.value) {
      case '+':
        resultValue = a + b;
        break;
      case '-':
        resultValue = a - b;
        break;
      case '*':
        resultValue = a * b;
        break;
      case '/':
        if (b === 0n) throw new Error(t('tools.big-number-calculator.page.errDivByZero'));
        resultValue = a / b;
        break;
      case '%':
        if (b === 0n) throw new Error(t('tools.big-number-calculator.page.errDivByZero'));
        resultValue = a % b;
        break;
      case '**':
        if (b < 0n) throw new Error(t('tools.big-number-calculator.page.errNegativePower'));
        if (b > 1000n) throw new Error(t('tools.big-number-calculator.page.errExponentTooLarge'));
        resultValue = a ** b;
        break;
      case 'gcd':
        resultValue = gcd(a, b);
        break;
      case 'lcm':
        resultValue = lcm(a, b);
        break;
      default:
        throw new Error(t('tools.big-number-calculator.page.errUnsupportedOp'));
    }

    const endTime = performance.now();
    const executionTime = Math.round(endTime - startTime);

    result.value = {
      value: resultValue.toString(),
      executionTime,
      formatted: formatNumber(resultValue),
      properties: analyzeNumber(resultValue)
    };

    // 添加到历史记录
    const expression = needsSecondNumber.value ? `${numberA.value} ${operator.value} ${numberB.value}` : `${operator.value}(${numberA.value})`;

    addToHistory(expression, resultValue.toString());
  } catch (err: any) {
    error.value = err.message || t('tools.big-number-calculator.page.calcError');
  }
};

// 单数运算
const factorial = () => {
  try {
    const n = BigInt(cleanNumber(numberA.value));
    if (n < 0n) throw new Error(t('tools.big-number-calculator.page.errFactorialNegative'));
    if (n > 1000n) throw new Error(t('tools.big-number-calculator.page.errFactorialTooLarge'));

    const startTime = performance.now();
    let result = 1n;
    for (let i = 2n; i <= n; i++) {
      result *= i;
    }
    const endTime = performance.now();

    setResult(result, endTime - startTime, `${numberA.value}!`);
  } catch (err: any) {
    error.value = err.message;
  }
};

const isPrime = () => {
  try {
    const n = BigInt(cleanNumber(numberA.value));
    if (n < 2n) {
      error.value = t('tools.big-number-calculator.page.errPrimeMin');
      return;
    }

    const startTime = performance.now();
    const prime = isPrimeNumber(n);
    const endTime = performance.now();

    result.value = {
      value: prime ? t('tools.big-number-calculator.page.primeYes') : t('tools.big-number-calculator.page.primeNo'),
      executionTime: Math.round(endTime - startTime),
      properties: {
        ...analyzeNumber(n),
        isPrime: prime
      }
    };

    addToHistory(`isPrime(${numberA.value})`, prime ? t('tools.big-number-calculator.page.primeYes') : t('tools.big-number-calculator.page.primeNo'));
  } catch (err: any) {
    error.value = err.message;
  }
};

const fibonacci = () => {
  try {
    const n = BigInt(cleanNumber(numberA.value));
    if (n < 0n) throw new Error(t('tools.big-number-calculator.page.errFibonacciNegative'));
    if (n > 10000n) throw new Error(t('tools.big-number-calculator.page.errNumberTooLarge'));

    const startTime = performance.now();
    const fib = fibonacciNumber(n);
    const endTime = performance.now();

    setResult(fib, endTime - startTime, `fibonacci(${numberA.value})`);
  } catch (err: any) {
    error.value = err.message;
  }
};

const digitSum = () => {
  try {
    const n = cleanNumber(numberA.value);
    const sum = n.split('').reduce((acc, digit) => acc + parseInt(digit), 0);

    result.value = {
      value: sum.toString(),
      formatted: formatNumber(BigInt(sum)),
      properties: analyzeNumber(BigInt(sum))
    };

    addToHistory(`digitSum(${numberA.value})`, sum.toString());
  } catch (err: any) {
    error.value = err.message;
  }
};

// 辅助函数
const gcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
};

const lcm = (a: bigint, b: bigint): bigint => {
  return (a * b) / gcd(a, b);
};

const isPrimeNumber = (n: bigint): boolean => {
  if (n < 2n) return false;
  if (n === 2n) return true;
  if (n % 2n === 0n) return false;

  const sqrt = BigInt(Math.floor(Math.sqrt(Number(n))));
  for (let i = 3n; i <= sqrt; i += 2n) {
    if (n % i === 0n) return false;
  }
  return true;
};

const fibonacciNumber = (n: bigint): bigint => {
  if (n <= 1n) return n;

  let a = 0n,
    b = 1n;
  for (let i = 2n; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
};

const formatNumber = (num: bigint) => {
  const str = num.toString();
  const withCommas = str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const formatted: any = { withCommas };

  // 科学计数法（仅对大数）
  if (str.length > 10) {
    const exp = str.length - 1;
    const mantissa = str[0] + '.' + str.slice(1, 6);
    formatted.scientific = `${mantissa}e+${exp}`;
  }

  // 二进制和十六进制（仅对较小的数）
  if (str.length <= 20 && num >= 0n) {
    try {
      formatted.binary = num.toString(2);
      formatted.hex = num.toString(16).toUpperCase();
    } catch {
      // 忽略转换错误
    }
  }

  return formatted;
};

const analyzeNumber = (num: bigint) => {
  return {
    isEven: num % 2n === 0n,
    isPositive: num > 0n,
    isNegative: num < 0n,
    digitCount: num.toString().replace('-', '').length
  };
};

const setResult = (value: bigint, executionTime: number, expression: string) => {
  result.value = {
    value: value.toString(),
    executionTime: Math.round(executionTime),
    formatted: formatNumber(value),
    properties: analyzeNumber(value)
  };

  addToHistory(expression, value.toString());
};

// 其他功能函数
const clear = () => {
  numberA.value = '';
  numberB.value = '';
  result.value = null;
  error.value = '';
};

const swapNumbers = () => {
  [numberA.value, numberB.value] = [numberB.value, numberA.value];
};

const loadExample = () => {
  const examples = [
    { a: '123456789012345678901234567890', b: '987654321098765432109876543210', op: '+' },
    { a: '2', b: '100', op: '**' },
    { a: '1000', b: '', op: 'factorial' },
    { a: '1234567890123456789', b: '9876543210987654321', op: 'gcd' }
  ];

  const example = examples[Math.floor(Math.random() * examples.length)];
  numberA.value = example.a;
  numberB.value = example.b;
  operator.value = example.op;
};

const copyResult = (text?: string) => {
  const textToCopy = text || result.value?.value;
  if (!textToCopy) return;

  navigator.clipboard.writeText(textToCopy).then(() => {
    // 可以添加成功提示
  });
};

const addToHistory = (expression: string, resultValue: string) => {
  history.value.unshift({
    expression,
    result: resultValue,
    timestamp: Date.now()
  });

  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value = history.value.slice(0, 50);
  }
};

const loadFromHistory = (item: HistoryItem) => {
  // 简单解析历史记录
  const parts = item.expression.split(' ');
  if (parts.length >= 3) {
    numberA.value = parts[0];
    operator.value = parts[1];
    numberB.value = parts[2];
  }
};

const clearHistory = () => {
  history.value = [];
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
