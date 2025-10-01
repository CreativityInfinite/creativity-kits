<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.statistics-tool.page.title') }}</h3>

        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.statistics-tool.page.dataInputTitle') }}</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.statistics-tool.page.inputLabel') }}</label>
                <textarea
                  v-model="dataInput"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  rows="6"
                  :placeholder="$t('tools.statistics-tool.page.inputPlaceholder')"
                  @input="parseData"
                />
                <p class="text-xs text-gray-500 mt-1">{{ $t('tools.statistics-tool.page.inputSupportTip') }}</p>
              </div>

              <div class="flex gap-2">
                <button @click="loadSampleData" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.statistics-tool.page.btnLoadSample') }}</button>
                <button @click="clearData" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.statistics-tool.page.btnClear') }}</button>
                <button @click="generateRandomData" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.statistics-tool.page.btnGenerateRandom') }}</button>
              </div>

              <div v-if="parseError" class="text-red-500 text-sm">
                {{ parseError }}
              </div>

              <div v-if="data.length > 0" class="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                <div class="text-sm">
                  <div class="font-medium text-blue-800 dark:text-blue-200 mb-1">{{ $t('tools.statistics-tool.page.overviewTitle') }}</div>
                  <div class="text-blue-700 dark:text-blue-300">
                    {{ $t('tools.statistics-tool.page.dataPoints') }} {{ data.length }} | {{ $t('tools.statistics-tool.page.rangeShort') }} {{ Math.min(...data).toFixed(2) }} ~
                    {{ Math.max(...data).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="data.length > 0" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.statistics-tool.page.vizTitle') }}</h4>
            <div class="space-y-3">
              <div class="bg-white dark:bg-gray-700 rounded p-3">
                <h5 class="text-sm font-medium mb-2">{{ $t('tools.statistics-tool.page.histogramTitle') }}</h5>
                <div class="space-y-1">
                  <div v-for="(bin, index) in histogram" :key="index" class="flex items-center gap-2 text-xs">
                    <span class="w-16 text-right">{{ bin.range }}</span>
                    <div class="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4 relative">
                      <div class="bg-blue-500 h-4 rounded-full transition-all duration-300" :style="{ width: `${(bin.count / Math.max(...histogram.map((b) => b.count))) * 100}%` }" />
                      <span class="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {{ bin.count }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-700 rounded p-3">
                <h5 class="text-sm font-medium mb-2">{{ $t('tools.statistics-tool.page.boxplotTitle') }}</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.minLabel') }}</span>
                    <span class="font-mono">{{ statistics.min.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.q1Label') }}</span>
                    <span class="font-mono">{{ statistics.q1.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.medianQ2Label') }}</span>
                    <span class="font-mono">{{ statistics.median.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.q3Label') }}</span>
                    <span class="font-mono">{{ statistics.q3.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.maxLabel') }}</span>
                    <span class="font-mono">{{ statistics.max.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.iqrLabel') }}</span>
                    <span class="font-mono">{{ statistics.iqr.toFixed(4) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.statistics-tool.page.resultsTitle') }}</h3>

        <div v-if="data.length > 0" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.statistics-tool.page.basicStatsTitle') }}</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.countLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.count }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.meanLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.mean.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.geometricMeanLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.geometricMean.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.harmonicMeanLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.harmonicMean.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.medianLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.median.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.modeLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.mode.join(', ') }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.minLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.min.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.maxLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.max.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.rangeLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.range.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.sumLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.sum.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.sumOfSquaresLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.sumOfSquares.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.meanAbsDevLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.meanAbsoluteDeviation.toFixed(6) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.statistics-tool.page.dispersionTitle') }}</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.sampleVarianceLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.sampleVariance.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.populationVarianceLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.populationVariance.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.sampleStdDevLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.sampleStdDev.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.populationStdDevLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.populationStdDev.toFixed(6) }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.cvLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.coefficientOfVariation.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.skewnessLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.skewness.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.kurtosisLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.kurtosis.toFixed(6) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.standardErrorLabel') }}</span>
                    <span class="font-mono font-medium">{{ statistics.standardError.toFixed(6) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.statistics-tool.page.quantilesTitle') }}</h4>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p5Label') }}</span>
                    <span class="font-mono">{{ getPercentile(5).toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p10Label') }}</span>
                    <span class="font-mono">{{ getPercentile(10).toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p25Label') }}</span>
                    <span class="font-mono">{{ statistics.q1.toFixed(4) }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p50Label') }}</span>
                    <span class="font-mono">{{ statistics.median.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p75Label') }}</span>
                    <span class="font-mono">{{ statistics.q3.toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p90Label') }}</span>
                    <span class="font-mono">{{ getPercentile(90).toFixed(4) }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p95Label') }}</span>
                    <span class="font-mono">{{ getPercentile(95).toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p99Label') }}</span>
                    <span class="font-mono">{{ getPercentile(99).toFixed(4) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.statistics-tool.page.p999Label') }}</span>
                    <span class="font-mono">{{ getPercentile(99.9).toFixed(4) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <div class="flex justify-between items-center">
                <h4 class="font-medium">{{ $t('tools.statistics-tool.page.ciTitle') }} ({{ confidenceLevel }}%)</h4>
                <select v-model="confidenceLevel" class="px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500">
                  <option value="90">90%</option>
                  <option value="95">95%</option>
                  <option value="99">99%</option>
                </select>
              </div>
            </div>
            <div class="p-4">
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>{{ $t('tools.statistics-tool.page.confidenceLevelLabel') }}</span>
                  <span class="font-mono">{{ confidenceLevel }}%</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.statistics-tool.page.lowerLabel') }}</span>
                  <span class="font-mono">{{ confidenceInterval.lower.toFixed(6) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.statistics-tool.page.upperLabel') }}</span>
                  <span class="font-mono">{{ confidenceInterval.upper.toFixed(6) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.statistics-tool.page.marginLabel') }}</span>
                  <span class="font-mono">± {{ confidenceInterval.margin.toFixed(6) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="exportResults" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.statistics-tool.page.btnExportReport') }}</button>
            <button @click="copyResults" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.statistics-tool.page.btnCopyResults') }}</button>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📊</div>
          <div class="text-lg mb-2">{{ $t('tools.statistics-tool.page.title') }}</div>
          <div class="text-sm">{{ $t('tools.statistics-tool.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.statistics-tool.page.instructionsTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.statistics-tool.page.supportedStatsTitle') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.statistics-tool.page.bulletCentralTendency') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletDispersion') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletShape') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletQuantiles') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletCI') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.statistics-tool.page.inputFormatTitle') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.statistics-tool.page.bulletCommaSep') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletSpaceSep') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletNewlineSep') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletMixed') }}</li>
            <li>{{ $t('tools.statistics-tool.page.bulletAutoFilter') }}</li>
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

interface Statistics {
  count: number;
  sum: number;
  mean: number;
  geometricMean: number;
  harmonicMean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  sampleVariance: number;
  populationVariance: number;
  sampleStdDev: number;
  populationStdDev: number;
  coefficientOfVariation: number;
  skewness: number;
  kurtosis: number;
  standardError: number;
  sumOfSquares: number;
  meanAbsoluteDeviation: number;
}

interface HistogramBin {
  range: string;
  count: number;
  min: number;
  max: number;
}

interface ConfidenceInterval {
  lower: number;
  upper: number;
  margin: number;
}

const dataInput = ref('');
const data = ref<number[]>([]);
const parseError = ref('');
const confidenceLevel = ref(95);

const statistics = computed((): Statistics => {
  if (data.value.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      geometricMean: 0,
      harmonicMean: 0,
      median: 0,
      mode: [],
      min: 0,
      max: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      sampleVariance: 0,
      populationVariance: 0,
      sampleStdDev: 0,
      populationStdDev: 0,
      coefficientOfVariation: 0,
      skewness: 0,
      kurtosis: 0,
      standardError: 0,
      sumOfSquares: 0,
      meanAbsoluteDeviation: 0
    };
  }

  const sorted = [...data.value].sort((a, b) => a - b);
  const n = sorted.length;

  // 基本统计量
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  // 中位数
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  // 四分位数
  const q1 = getPercentileValue(sorted, 25);
  const q3 = getPercentileValue(sorted, 75);
  const iqr = q3 - q1;

  // 众数
  const frequency: { [key: number]: number } = {};
  sorted.forEach((val) => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Object.keys(frequency)
    .filter((key) => frequency[Number(key)] === maxFreq)
    .map(Number);

  // 几何平均数 (仅适用于正数)
  const positiveValues = sorted.filter((val) => val > 0);
  const geometricMean =
    positiveValues.length > 0
      ? Math.pow(
          positiveValues.reduce((acc, val) => acc * val, 1),
          1 / positiveValues.length
        )
      : 0;

  // 调和平均数 (仅适用于正数)
  const harmonicMean = positiveValues.length > 0 ? positiveValues.length / positiveValues.reduce((acc, val) => acc + 1 / val, 0) : 0;

  // 方差和标准差
  const sumOfSquaredDiffs = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const populationVariance = sumOfSquaredDiffs / n;
  const sampleVariance = n > 1 ? sumOfSquaredDiffs / (n - 1) : 0;
  const populationStdDev = Math.sqrt(populationVariance);
  const sampleStdDev = Math.sqrt(sampleVariance);

  // 变异系数
  const coefficientOfVariation = mean !== 0 ? sampleStdDev / Math.abs(mean) : 0;

  // 偏度
  const sumOfCubedDiffs = sorted.reduce((acc, val) => acc + Math.pow((val - mean) / sampleStdDev, 3), 0);
  const skewness = n > 2 ? (n / ((n - 1) * (n - 2))) * sumOfCubedDiffs : 0;

  // 峰度
  const sumOfFourthPowerDiffs = sorted.reduce((acc, val) => acc + Math.pow((val - mean) / sampleStdDev, 4), 0);
  const kurtosis = n > 3 ? ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sumOfFourthPowerDiffs - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3)) : 0;

  // 标准误差
  const standardError = sampleStdDev / Math.sqrt(n);

  // 平方和
  const sumOfSquares = sorted.reduce((acc, val) => acc + val * val, 0);

  // 平均绝对偏差
  const meanAbsoluteDeviation = sorted.reduce((acc, val) => acc + Math.abs(val - mean), 0) / n;

  return {
    count: n,
    sum,
    mean,
    geometricMean,
    harmonicMean,
    median,
    mode,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    sampleVariance,
    populationVariance,
    sampleStdDev,
    populationStdDev,
    coefficientOfVariation,
    skewness,
    kurtosis,
    standardError,
    sumOfSquares,
    meanAbsoluteDeviation
  };
});

const histogram = computed((): HistogramBin[] => {
  if (data.value.length === 0) return [];

  const sorted = [...data.value].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  if (range === 0) {
    return [
      {
        range: min.toFixed(2),
        count: sorted.length,
        min,
        max
      }
    ];
  }

  const binCount = Math.min(10, Math.ceil(Math.sqrt(sorted.length)));
  const binWidth = range / binCount;
  const bins: HistogramBin[] = [];

  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = i === binCount - 1 ? max : min + (i + 1) * binWidth;
    const count = sorted.filter((val) => val >= binMin && val < binMax).length;

    bins.push({
      range: `${binMin.toFixed(2)}-${binMax.toFixed(2)}`,
      count,
      min: binMin,
      max: binMax
    });
  }

  return bins;
});

const confidenceInterval = computed((): ConfidenceInterval => {
  if (data.value.length === 0) {
    return { lower: 0, upper: 0, margin: 0 };
  }

  // t分布临界值 (近似)
  const alpha = (100 - confidenceLevel.value) / 100;
  const df = data.value.length - 1;
  let tValue: number;

  if (confidenceLevel.value === 90) tValue = 1.645;
  else if (confidenceLevel.value === 95) tValue = 1.96;
  else if (confidenceLevel.value === 99) tValue = 2.576;
  else tValue = 1.96;

  // 对于小样本使用t分布修正
  if (df < 30) {
    if (confidenceLevel.value === 90) tValue = 1.833;
    else if (confidenceLevel.value === 95) tValue = 2.262;
    else if (confidenceLevel.value === 99) tValue = 3.25;
  }

  const margin = tValue * statistics.value.standardError;
  const lower = statistics.value.mean - margin;
  const upper = statistics.value.mean + margin;

  return { lower, upper, margin };
});

function parseData() {
  parseError.value = '';

  if (!dataInput.value.trim()) {
    data.value = [];
    return;
  }

  try {
    // 支持多种分隔符: 逗号、空格、换行、分号
    const numbers = dataInput.value
      .split(/[,\s\n;]+/)
      .map((str) => str.trim())
      .filter((str) => str !== '')
      .map((str) => {
        const num = parseFloat(str);
        if (isNaN(num)) {
          throw new Error(t('tools.statistics-tool.page.invalidNumber', { str }));
        }
        return num;
      });

    if (numbers.length === 0) {
      throw new Error(t('tools.statistics-tool.page.noValidNumbers'));
    }

    data.value = numbers;
  } catch (error) {
    parseError.value = (error as Error).message;
    data.value = [];
  }
}

function getPercentileValue(sortedData: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedData.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedData[lower];
  }

  const weight = index - lower;
  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
}

function getPercentile(percentile: number): number {
  if (data.value.length === 0) return 0;
  const sorted = [...data.value].sort((a, b) => a - b);
  return getPercentileValue(sorted, percentile);
}

function loadSampleData() {
  dataInput.value = '23, 45, 56, 78, 32, 67, 89, 12, 34, 56, 78, 90, 23, 45, 67, 89, 34, 56, 78, 23';
  parseData();
}

function clearData() {
  dataInput.value = '';
  data.value = [];
  parseError.value = '';
}

function generateRandomData() {
  const count = 50;
  const mean = 100;
  const stdDev = 15;

  const randomData: number[] = [];
  for (let i = 0; i < count; i++) {
    // 使用Box-Muller变换生成正态分布随机数
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = mean + z * stdDev;
    randomData.push(Math.round(value * 100) / 100);
  }

  dataInput.value = randomData.join(', ');
  parseData();
}

function exportResults() {
  const stats = statistics.value;
  const report = `${t('tools.statistics-tool.page.reportTitle')}
${t('tools.statistics-tool.page.generatedAt')} ${new Date().toLocaleString('zh-CN')}
${t('tools.statistics-tool.page.dataPointCount')} ${stats.count}

${t('tools.statistics-tool.page.sectionBasicStats')}
${t('tools.statistics-tool.page.meanLabel')} ${stats.mean.toFixed(6)}
${t('tools.statistics-tool.page.geometricMeanLabel')} ${stats.geometricMean.toFixed(6)}
${t('tools.statistics-tool.page.harmonicMeanLabel')} ${stats.harmonicMean.toFixed(6)}
${t('tools.statistics-tool.page.medianLabel')} ${stats.median.toFixed(6)}
${t('tools.statistics-tool.page.modeLabel')} ${stats.mode.join(', ')}
${t('tools.statistics-tool.page.minLabel')} ${stats.min.toFixed(6)}
${t('tools.statistics-tool.page.maxLabel')} ${stats.max.toFixed(6)}
${t('tools.statistics-tool.page.rangeLabel')} ${stats.range.toFixed(6)}
${t('tools.statistics-tool.page.sumLabel')} ${stats.sum.toFixed(6)}

${t('tools.statistics-tool.page.sectionDispersion')}
${t('tools.statistics-tool.page.sampleVarianceLabel')} ${stats.sampleVariance.toFixed(6)}
${t('tools.statistics-tool.page.populationVarianceLabel')} ${stats.populationVariance.toFixed(6)}
${t('tools.statistics-tool.page.sampleStdDevLabel')} ${stats.sampleStdDev.toFixed(6)}
${t('tools.statistics-tool.page.populationStdDevLabel')} ${stats.populationStdDev.toFixed(6)}
${t('tools.statistics-tool.page.cvLabel')} ${stats.coefficientOfVariation.toFixed(6)}
${t('tools.statistics-tool.page.standardErrorLabel')} ${stats.standardError.toFixed(6)}
${t('tools.statistics-tool.page.meanAbsDevLabel')} ${stats.meanAbsoluteDeviation.toFixed(6)}

${t('tools.statistics-tool.page.sectionShape')}
${t('tools.statistics-tool.page.skewnessLabel')} ${stats.skewness.toFixed(6)}
${t('tools.statistics-tool.page.kurtosisLabel')} ${stats.kurtosis.toFixed(6)}

${t('tools.statistics-tool.page.sectionQuartiles')}
${t('tools.statistics-tool.page.q1Label')} ${stats.q1.toFixed(6)}
${t('tools.statistics-tool.page.medianQ2Label')} ${stats.median.toFixed(6)}
${t('tools.statistics-tool.page.q3Label')} ${stats.q3.toFixed(6)}
${t('tools.statistics-tool.page.iqrLabel')} ${stats.iqr.toFixed(6)}

${t('tools.statistics-tool.page.sectionCI', { level: confidenceLevel.value })}
${t('tools.statistics-tool.page.lowerLabel')} ${confidenceInterval.value.lower.toFixed(6)}
${t('tools.statistics-tool.page.upperLabel')} ${confidenceInterval.value.upper.toFixed(6)}
${t('tools.statistics-tool.page.marginLabel')} ± ${confidenceInterval.value.margin.toFixed(6)}

${t('tools.statistics-tool.page.sectionRawData')}
${data.value.join(', ')}

${t('tools.statistics-tool.page.reportGeneratedAt')} ${new Date().toLocaleString('zh-CN')}
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `statistics-report-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyResults() {
  const stats = statistics.value;
  const summary = `${t('tools.statistics-tool.page.summaryTitle', { n: stats.count })}
${t('tools.statistics-tool.page.summaryMean')} ${stats.mean.toFixed(4)} ${t('tools.statistics-tool.page.summaryPlusMinus')} ${stats.standardError.toFixed(4)}
${t('tools.statistics-tool.page.summaryMedian')} ${stats.median.toFixed(4)}
${t('tools.statistics-tool.page.summaryStdDev')} ${stats.sampleStdDev.toFixed(4)}
${t('tools.statistics-tool.page.summaryRange')} ${stats.min.toFixed(4)} - ${stats.max.toFixed(4)}
${confidenceLevel.value}% ${t('tools.statistics-tool.page.summaryCI')} [${confidenceInterval.value.lower.toFixed(4)}, ${confidenceInterval.value.upper.toFixed(4)}]`;

  try {
    await navigator.clipboard.writeText(summary);
    // 这里可以添加成功提示
  } catch (error) {
    console.error(t('tools.statistics-tool.page.copyFailedLog'), error);
  }
}
</script>
