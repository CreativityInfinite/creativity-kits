<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.matrix-calculator.page.matrixALabel') }}</label>
          <div class="space-y-2">
            <div class="flex gap-2">
              <select v-model="matrixA.rows" @change="resizeMatrix('A')" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option v-for="n in 5" :key="n" :value="n">{{ $t('tools.matrix-calculator.page.rowsOption', { n }) }}</option>
              </select>
              <select v-model="matrixA.cols" @change="resizeMatrix('A')" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option v-for="n in 5" :key="n" :value="n">{{ $t('tools.matrix-calculator.page.colsOption', { n }) }}</option>
              </select>
            </div>

            <div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${matrixA.cols}, 1fr)` }">
              <input
                v-for="(value, index) in matrixA.data"
                :key="index"
                v-model.number="matrixA.data[index]"
                type="number"
                step="0.1"
                class="w-16 h-12 px-2 py-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.matrix-calculator.page.matrixBLabel') }}</label>
          <div class="space-y-2">
            <div class="flex gap-2">
              <select v-model="matrixB.rows" @change="resizeMatrix('B')" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option v-for="n in 5" :key="n" :value="n">{{ $t('tools.matrix-calculator.page.rowsOption', { n }) }}</option>
              </select>
              <select v-model="matrixB.cols" @change="resizeMatrix('B')" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option v-for="n in 5" :key="n" :value="n">{{ $t('tools.matrix-calculator.page.colsOption', { n }) }}</option>
              </select>
            </div>

            <div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${matrixB.cols}, 1fr)` }">
              <input
                v-for="(value, index) in matrixB.data"
                :key="index"
                v-model.number="matrixB.data[index]"
                type="number"
                step="0.1"
                class="w-16 h-12 px-2 py-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button @click="calculate('add')" :disabled="!canAddSubtract" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.matrix-calculator.page.opAdd') }}
          </button>
          <button @click="calculate('subtract')" :disabled="!canAddSubtract" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.matrix-calculator.page.opSubtract') }}
          </button>
          <button @click="calculate('multiply')" :disabled="!canMultiply" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.matrix-calculator.page.opMultiply') }}
          </button>
          <button @click="calculate('determinant')" :disabled="!isSquareA" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.matrix-calculator.page.opDeterminant') }}
          </button>
        </div>

        <div class="flex gap-2">
          <button @click="fillRandom('A')" class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">{{ $t('tools.matrix-calculator.page.randomFillA') }}</button>
          <button @click="fillRandom('B')" class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">{{ $t('tools.matrix-calculator.page.randomFillB') }}</button>
          <button @click="clearMatrices" class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">{{ $t('tools.matrix-calculator.page.clear') }}</button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="result">
          <h3 class="font-medium mb-2">{{ $t('tools.matrix-calculator.page.resultTitle') }}</h3>
          <div v-if="result.type === 'matrix'" class="space-y-2">
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.matrix-calculator.page.matrixSize', { rows: result.rows, cols: result.cols }) }}</div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <div class="grid gap-1" :style="{ gridTemplateColumns: `repeat(${result.cols}, 1fr)` }">
                <div v-for="(value, index) in result.data" :key="index" class="w-16 h-12 flex items-center justify-center bg-white dark:bg-gray-700 border rounded text-sm font-mono">
                  {{ formatNumber(value) }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="result.type === 'scalar'" class="space-y-2">
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.matrix-calculator.page.scalarTitle') }}</div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center">
              <div class="text-2xl font-mono font-bold">{{ formatNumber(result.value) }}</div>
            </div>
          </div>

          <div v-if="result.error" class="bg-red-50 dark:bg-red-900/20 rounded p-3">
            <div class="text-sm text-red-800 dark:text-red-200">{{ result.error }}</div>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.matrix-calculator.page.guideTitle') }}</h3>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>{{ $t('tools.matrix-calculator.page.guideAddSub') }}</li>
            <li>{{ $t('tools.matrix-calculator.page.guideMul') }}</li>
            <li>{{ $t('tools.matrix-calculator.page.guideDet') }}</li>
            <li>{{ $t('tools.matrix-calculator.page.guideFloat') }}</li>
          </ul>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 class="text-sm font-medium mb-2">{{ $t('tools.matrix-calculator.page.infoTitle') }}</h3>
          <div class="text-sm space-y-1">
            <div>{{ $t('tools.matrix-calculator.page.matrixAInfo', { rows: matrixA.rows, cols: matrixA.cols, square: isSquareA ? $t('tools.matrix-calculator.page.square') : '' }) }}</div>
            <div>{{ $t('tools.matrix-calculator.page.matrixBInfo', { rows: matrixB.rows, cols: matrixB.cols, square: isSquareB ? $t('tools.matrix-calculator.page.square') : '' }) }}</div>
            <div class="text-gray-600 dark:text-gray-400">
              {{ $t('tools.matrix-calculator.page.canAddSubtract', { v: canAddSubtract ? $t('tools.matrix-calculator.page.yes') : $t('tools.matrix-calculator.page.no') }) }}
              |
              {{ $t('tools.matrix-calculator.page.canMultiply', { v: canMultiply ? $t('tools.matrix-calculator.page.yes') : $t('tools.matrix-calculator.page.no') }) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Matrix {
  rows: number;
  cols: number;
  data: number[];
}

const matrixA = ref<Matrix>({
  rows: 2,
  cols: 2,
  data: [1, 2, 3, 4]
});

const matrixB = ref<Matrix>({
  rows: 2,
  cols: 2,
  data: [5, 6, 7, 8]
});

const result = ref<any>(null);
const { t } = useI18n();

const canAddSubtract = computed(() => {
  return matrixA.value.rows === matrixB.value.rows && matrixA.value.cols === matrixB.value.cols;
});

const canMultiply = computed(() => {
  return matrixA.value.cols === matrixB.value.rows;
});

const isSquareA = computed(() => {
  return matrixA.value.rows === matrixA.value.cols;
});

const isSquareB = computed(() => {
  return matrixB.value.rows === matrixB.value.cols;
});

function resizeMatrix(matrix: 'A' | 'B') {
  const target = matrix === 'A' ? matrixA.value : matrixB.value;
  const newSize = target.rows * target.cols;

  if (target.data.length < newSize) {
    // 扩展矩阵，用0填充
    target.data = [...target.data, ...Array(newSize - target.data.length).fill(0)];
  } else if (target.data.length > newSize) {
    // 缩小矩阵
    target.data = target.data.slice(0, newSize);
  }
}

function calculate(operation: string) {
  try {
    switch (operation) {
      case 'add':
        result.value = addMatrices(matrixA.value, matrixB.value);
        break;
      case 'subtract':
        result.value = subtractMatrices(matrixA.value, matrixB.value);
        break;
      case 'multiply':
        result.value = multiplyMatrices(matrixA.value, matrixB.value);
        break;
      case 'determinant':
        result.value = calculateDeterminant(matrixA.value);
        break;
    }
  } catch (error: any) {
    result.value = { error: error.message };
  }
}

function addMatrices(a: Matrix, b: Matrix): any {
  if (a.rows !== b.rows || a.cols !== b.cols) {
    throw new Error(t('tools.matrix-calculator.page.errDimMismatch'));
  }

  const data = a.data.map((val, index) => val + b.data[index]);

  return {
    type: 'matrix',
    rows: a.rows,
    cols: a.cols,
    data
  };
}

function subtractMatrices(a: Matrix, b: Matrix): any {
  if (a.rows !== b.rows || a.cols !== b.cols) {
    throw new Error(t('tools.matrix-calculator.page.errDimMismatch'));
  }

  const data = a.data.map((val, index) => val - b.data[index]);

  return {
    type: 'matrix',
    rows: a.rows,
    cols: a.cols,
    data
  };
}

function multiplyMatrices(a: Matrix, b: Matrix): any {
  if (a.cols !== b.rows) {
    throw new Error(t('tools.matrix-calculator.page.errDimMismatchMul'));
  }

  const result = [];

  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < b.cols; j++) {
      let sum = 0;
      for (let k = 0; k < a.cols; k++) {
        sum += a.data[i * a.cols + k] * b.data[k * b.cols + j];
      }
      result.push(sum);
    }
  }

  return {
    type: 'matrix',
    rows: a.rows,
    cols: b.cols,
    data: result
  };
}

function calculateDeterminant(matrix: Matrix): any {
  if (matrix.rows !== matrix.cols) {
    throw new Error(t('tools.matrix-calculator.page.errDetSquareOnly'));
  }

  const n = matrix.rows;

  if (n === 1) {
    return { type: 'scalar', value: matrix.data[0] };
  }

  if (n === 2) {
    const det = matrix.data[0] * matrix.data[3] - matrix.data[1] * matrix.data[2];
    return { type: 'scalar', value: det };
  }

  if (n === 3) {
    const [a, b, c, d, e, f, g, h, i] = matrix.data;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    return { type: 'scalar', value: det };
  }

  throw new Error(t('tools.matrix-calculator.page.errDetTooLarge'));
}

function fillRandom(matrix: 'A' | 'B') {
  const target = matrix === 'A' ? matrixA.value : matrixB.value;
  target.data = target.data.map(() => Math.floor(Math.random() * 20) - 10);
}

function clearMatrices() {
  matrixA.value.data.fill(0);
  matrixB.value.data.fill(0);
  result.value = null;
}

function formatNumber(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2);
}
</script>
