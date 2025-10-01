<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.csv-to-json.page.title') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.csv-to-json.page.inputContent') }}</h4>
            <div class="flex gap-2">
              <button @click="convertToJson" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.convertToJson') }}</button>
              <button @click="convertToCsv" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.convertToCsv') }}</button>
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.clearAll') }}</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.inputFormat') }}</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="inputFormat" type="radio" value="csv" @change="handleFormatChange" />
                  <span class="text-sm">{{ $t('tools.csv-to-json.page.csv') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="inputFormat" type="radio" value="json" @change="handleFormatChange" />
                  <span class="text-sm">{{ $t('tools.csv-to-json.page.json') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="inputFormat" type="radio" value="auto" @change="handleFormatChange" />
                  <span class="text-sm">{{ $t('tools.csv-to-json.page.autoDetect') }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.inputContent') }}</label>
              <textarea
                v-model="inputText"
                rows="12"
                :placeholder="$t('tools.csv-to-json.page.placeholder')"
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoConvert"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>{{ $t('tools.csv-to-json.page.charCount') }}: {{ inputText.length }}</span>
              <span>{{ $t('tools.csv-to-json.page.lineCount') }}: {{ inputText.split('\n').length }}</span>
              <span v-if="detectedFormat">{{ $t('tools.csv-to-json.page.detectedFormat') }}: {{ detectedFormat.toUpperCase() }}</span>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span>⚠️</span>
                <span class="font-medium">{{ $t('tools.csv-to-json.page.conversionError') }}</span>
              </div>
              <div class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.csv-to-json.page.csvParseOptions') }}</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-to-json.page.delimiter') }}</label>
                <select v-model="csvOptions.delimiter" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value=",">{{ $t('tools.csv-to-json.page.comma') }}</option>
                  <option value=";">{{ $t('tools.csv-to-json.page.semicolon') }}</option>
                  <option value="\t">{{ $t('tools.csv-to-json.page.tab') }}</option>
                  <option value="|">{{ $t('tools.csv-to-json.page.pipeDelimiter') }}</option>
                  <option value="custom">{{ $t('tools.csv-to-json.page.custom') }}</option>
                </select>
              </div>
              <div v-if="csvOptions.delimiter === 'custom'">
                <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-to-json.page.customDelimiter') }}</label>
                <input
                  v-model="csvOptions.customDelimiter"
                  type="text"
                  :placeholder="$t('tools.csv-to-json.page.enterDelimiter')"
                  class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-to-json.page.quoteChar') }}</label>
                <select v-model="csvOptions.quote" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value='"'>{{ $t('tools.csv-to-json.page.doubleQuote') }}</option>
                  <option value="'">{{ $t('tools.csv-to-json.page.singleQuote') }}</option>
                  <option value="">{{ $t('tools.csv-to-json.page.noQuote') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.csv-to-json.page.escapeChar') }}</label>
                <select v-model="csvOptions.escape" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value='"'>{{ $t('tools.csv-to-json.page.doubleQuote') }}</option>
                  <option value="\\">{{ $t('tools.csv-to-json.page.backslash') }}</option>
                  <option value="">{{ $t('tools.csv-to-json.page.noEscape') }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="csvOptions.hasHeader" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.hasHeader') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="csvOptions.skipEmptyLines" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.skipEmptyLines') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="csvOptions.trimWhitespace" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.trimWhitespace') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="csvOptions.autoDetectTypes" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.autoTypeDetection') }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.csv-to-json.page.jsonOutputOptions') }}</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="jsonOptions.prettyPrint" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.prettyPrint') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="jsonOptions.sortKeys" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.sortKeys') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="jsonOptions.arrayFormat" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.arrayFormat') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="jsonOptions.autoConvert" type="checkbox" />
                <span class="text-sm">{{ $t('tools.csv-to-json.page.autoConvert') }}</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.jsonIndent') }}: {{ jsonOptions.indent }}</label>
              <input v-model.number="jsonOptions.indent" type="range" min="1" max="8" class="w-full" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.csv-to-json.page.quickActions') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleCsv" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.loadCsvSample') }}</button>
            <button @click="loadSampleJson" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.loadJsonSample') }}</button>
            <button @click="detectDelimiter" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.autoDetectDelimiter') }}</button>
            <button @click="validateInput" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.validateFormat') }}</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.csv-to-json.page.fileOperations') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".csv,.json,.txt" @change="handleFileUpload" class="hidden" />
              {{ $t('tools.csv-to-json.page.uploadFile') }}
            </label>
            <button @click="downloadResult" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.downloadResult') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.csv-to-json.page.conversionResult') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.csv-to-json.page.outputResult') }} ({{ outputFormat.toUpperCase() }})</h4>
            <div class="flex gap-2">
              <button @click="copyOutput" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.copyOutput') }}</button>
              <button @click="previewTable" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.previewTable') }}</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="outputText" class="space-y-3">
              <textarea
                v-model="outputText"
                rows="12"
                readonly
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>

              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ $t('tools.csv-to-json.page.charCount') }}: {{ outputText.length }}</span>
                <span>{{ $t('tools.csv-to-json.page.lineCount') }}: {{ outputText.split('\n').length }}</span>
                <span v-if="compressionRatio">{{ $t('tools.csv-to-json.page.compressionRatio') }}: {{ compressionRatio }}%</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">{{ $t('tools.csv-to-json.page.inputContentToShowResult') }}</div>
          </div>
        </div>

        <div v-if="showTablePreview" class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.csv-to-json.page.tablePreview') }}</h4>
            <button @click="showTablePreview = false" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.close') }}</button>
          </div>
          <div class="p-4 overflow-auto max-h-96">
            <table v-if="tableData.length > 0" class="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
              <thead v-if="csvOptions.hasHeader && tableHeaders.length > 0">
                <tr class="bg-gray-100 dark:bg-gray-700">
                  <th v-for="(header, index) in tableHeaders" :key="index" class="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left font-medium">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in tableData.slice(0, 100)" :key="rowIndex" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="border border-gray-300 dark:border-gray-600 px-2 py-1">
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="tableData.length > 100" class="mt-2 text-sm text-gray-500 text-center">{{ $t('tools.csv-to-json.page.showingFirst100Rows', { count: tableData.length }) }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.csv-to-json.page.dataAnalysis') }}</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.csv-to-json.page.inputFormatAnalysis') }}</div>
                  <div class="font-medium">{{ analysis.inputFormat }}</div>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.csv-to-json.page.outputFormatAnalysis') }}</div>
                  <div class="font-medium">{{ analysis.outputFormat }}</div>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.csv-to-json.page.rowCount') }}</div>
                  <div class="font-medium">{{ analysis.rowCount }}</div>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.csv-to-json.page.columnCount') }}</div>
                  <div class="font-medium">{{ analysis.columnCount }}</div>
                </div>
              </div>

              <div v-if="analysis.columns && analysis.columns.length > 0">
                <div class="text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.columnInfo') }}:</div>
                <div class="space-y-2">
                  <div v-for="(column, index) in analysis.columns.slice(0, 10)" :key="index" class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                    <span class="font-mono">{{ column.name }}</span>
                    <div class="flex gap-2">
                      <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">{{ column.type }}</span>
                      <span class="text-gray-500">{{ column.sampleValue }}</span>
                    </div>
                  </div>
                  <div v-if="analysis.columns.length > 10" class="text-center text-sm text-gray-500">{{ $t('tools.csv-to-json.page.moreColumns', { count: analysis.columns.length - 10 }) }}</div>
                </div>
              </div>

              <div v-if="analysis.statistics">
                <div class="text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.statistics') }}:</div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.csv-to-json.page.nullCount') }}:</span>
                    <span class="font-mono">{{ analysis.statistics.nullCount }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.csv-to-json.page.numericColumns') }}:</span>
                    <span class="font-mono">{{ analysis.statistics.numericColumns }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.csv-to-json.page.textColumns') }}:</span>
                    <span class="font-mono">{{ analysis.statistics.textColumns }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.csv-to-json.page.booleanColumns') }}:</span>
                    <span class="font-mono">{{ analysis.statistics.booleanColumns }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">{{ $t('tools.csv-to-json.page.inputContentToShowAnalysis') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.csv-to-json.page.conversionHistory') }}</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.csv-to-json.page.clearHistory') }}</button>
          </div>
          <div class="p-4">
            <div v-if="conversionHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in conversionHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.conversion }} - {{ history.timestamp }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.csv-to-json.page.load') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">{{ $t('tools.csv-to-json.page.noHistory') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.csv-to-json.page.usageInstructions') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.csv-to-json.page.csvToJson') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.autoDetection') }}:</strong> {{ $t('tools.csv-to-json.page.autoDetectionDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.headerProcessing') }}:</strong> {{ $t('tools.csv-to-json.page.headerProcessingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.typeConversion') }}:</strong> {{ $t('tools.csv-to-json.page.typeConversionDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.formatSelection') }}:</strong> {{ $t('tools.csv-to-json.page.formatSelectionDesc') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.csv-to-json.page.jsonToCsv') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.flattening') }}:</strong> {{ $t('tools.csv-to-json.page.flatteningDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.arrayProcessing') }}:</strong> {{ $t('tools.csv-to-json.page.arrayProcessingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.fieldMapping') }}:</strong> {{ $t('tools.csv-to-json.page.fieldMappingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.quoteHandling') }}:</strong> {{ $t('tools.csv-to-json.page.quoteHandlingDesc') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.csv-to-json.page.advancedFeatures') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.fileUpload') }}:</strong> {{ $t('tools.csv-to-json.page.fileUploadDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.tablePreview') }}:</strong> {{ $t('tools.csv-to-json.page.tablePreviewDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.dataAnalysis') }}:</strong> {{ $t('tools.csv-to-json.page.dataAnalysisDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.csv-to-json.page.batchProcessing') }}:</strong> {{ $t('tools.csv-to-json.page.batchProcessingDesc') }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Analysis {
  inputFormat: string;
  outputFormat: string;
  rowCount: number;
  columnCount: number;
  columns?: Array<{
    name: string;
    type: string;
    sampleValue: string;
  }>;
  statistics?: {
    nullCount: number;
    numericColumns: number;
    textColumns: number;
    booleanColumns: number;
  };
}

interface ConversionHistory {
  input: string;
  output: string;
  conversion: string;
  timestamp: string;
  preview: string;
}

const inputFormat = ref<'csv' | 'json' | 'auto'>('auto');
const inputText = ref('');
const outputText = ref('');
const outputFormat = ref<'csv' | 'json'>('json');
const error = ref('');
const detectedFormat = ref<'csv' | 'json' | null>(null);
const showTablePreview = ref(false);

const csvOptions = ref({
  delimiter: ',',
  customDelimiter: '',
  quote: '"',
  escape: '"',
  hasHeader: true,
  skipEmptyLines: true,
  trimWhitespace: true,
  autoDetectTypes: true
});

const jsonOptions = ref({
  prettyPrint: true,
  sortKeys: false,
  arrayFormat: false, // false: 对象数组, true: 二维数组
  autoConvert: true,
  indent: 2
});

const analysis = ref<Analysis | null>(null);
const conversionHistory = ref<ConversionHistory[]>([]);
const tableData = ref<string[][]>([]);
const tableHeaders = ref<string[]>([]);

const compressionRatio = computed(() => {
  if (!inputText.value || !outputText.value) return null;
  const originalSize = new Blob([inputText.value]).size;
  const convertedSize = new Blob([outputText.value]).size;
  if (originalSize === 0) return null;
  return Math.round(((convertedSize - originalSize) / originalSize) * 100);
});

watch(
  [() => csvOptions.value, () => jsonOptions.value],
  () => {
    if (inputText.value && outputText.value) {
      autoConvert();
    }
  },
  { deep: true }
);

function handleFormatChange() {
  if (inputText.value) {
    autoConvert();
  }
}

function autoConvert() {
  if (!jsonOptions.value.autoConvert || !inputText.value.trim()) {
    outputText.value = '';
    analysis.value = null;
    return;
  }

  const format = detectFormat();
  if (format === 'csv') {
    convertToJson();
  } else if (format === 'json') {
    convertToCsv();
  }
}

function detectFormat(): 'csv' | 'json' | null {
  if (inputFormat.value !== 'auto') {
    detectedFormat.value = inputFormat.value;
    return inputFormat.value;
  }

  const text = inputText.value.trim();
  if (!text) return null;

  // 尝试解析为 JSON
  try {
    JSON.parse(text);
    detectedFormat.value = 'json';
    return 'json';
  } catch {
    // JSON 解析失败，可能是 CSV
  }

  // 检查 CSV 特征
  const lines = text.split('\n');
  if (lines.length > 1) {
    const firstLine = lines[0];
    const secondLine = lines[1];

    // 检查是否包含常见的 CSV 分隔符
    const delimiters = [',', ';', '\t', '|'];
    for (const delimiter of delimiters) {
      const firstCount = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      const secondCount = (secondLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;

      if (firstCount > 0 && firstCount === secondCount) {
        detectedFormat.value = 'csv';
        return 'csv';
      }
    }
  }

  // 默认尝试 CSV
  detectedFormat.value = 'csv';
  return 'csv';
}

function convertToJson() {
  error.value = '';

  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = $t('tools.csv-to-json.page.enterCsvContent');
      return;
    }

    const delimiter = csvOptions.value.delimiter === 'custom' ? csvOptions.value.customDelimiter : csvOptions.value.delimiter;

    const parsed = parseCsv(input, delimiter);

    let result: any;
    if (jsonOptions.value.arrayFormat) {
      // 二维数组格式
      result = parsed;
    } else {
      // 对象数组格式
      if (csvOptions.value.hasHeader && parsed.length > 0) {
        const headers = parsed[0];
        const rows = parsed.slice(1);
        result = rows.map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
      } else {
        // 没有标题行，使用索引作为键名
        result = parsed.map((row) => {
          const obj: any = {};
          row.forEach((cell, index) => {
            obj[`column_${index}`] = cell;
          });
          return obj;
        });
      }
    }

    if (jsonOptions.value.sortKeys && !jsonOptions.value.arrayFormat) {
      result = result.map((obj: any) => sortObjectKeys(obj));
    }

    let jsonString = '';
    if (jsonOptions.value.prettyPrint) {
      jsonString = JSON.stringify(result, null, jsonOptions.value.indent);
    } else {
      jsonString = JSON.stringify(result);
    }

    outputText.value = jsonString;
    outputFormat.value = 'json';

    // 设置表格数据
    tableData.value = parsed;
    tableHeaders.value = csvOptions.value.hasHeader && parsed.length > 0 ? parsed[0] : [];

    analyzeData(parsed, 'csv', 'json');
    addToHistory(input, jsonString, 'CSV → JSON');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'CSV 解析失败';
  }
}

function convertToCsv() {
  error.value = '';

  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = $t('tools.csv-to-json.page.enterJsonContent');
      return;
    }

    const parsed = JSON.parse(input);

    if (!Array.isArray(parsed)) {
      error.value = $t('tools.csv-to-json.page.jsonMustBeArray');
      return;
    }

    const delimiter = csvOptions.value.delimiter === 'custom' ? csvOptions.value.customDelimiter : csvOptions.value.delimiter;

    const csvString = stringifyCsv(parsed, delimiter);

    outputText.value = csvString;
    outputFormat.value = 'csv';

    // 解析 CSV 用于表格预览
    const csvData = parseCsv(csvString, delimiter);
    tableData.value = csvData;
    tableHeaders.value = csvOptions.value.hasHeader && csvData.length > 0 ? csvData[0] : [];

    analyzeData(csvData, 'json', 'csv');
    addToHistory(input, csvString, 'JSON → CSV');
  } catch (err) {
    error.value = err instanceof Error ? err.message : $t('tools.csv-to-json.page.jsonParseFailed');
  }
}

function parseCsv(csvString: string, delimiter: string): string[][] {
  const lines = csvString.split('\n');
  const result: string[][] = [];
  const quote = csvOptions.value.quote;
  const escape = csvOptions.value.escape;

  for (let line of lines) {
    if (csvOptions.value.skipEmptyLines && !line.trim()) continue;

    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === quote && !inQuotes) {
        // 开始引号
        inQuotes = true;
      } else if (char === quote && inQuotes) {
        if (nextChar === quote && escape === quote) {
          // 转义的引号
          current += quote;
          i++; // 跳过下一个引号
        } else {
          // 结束引号
          inQuotes = false;
        }
      } else if (char === escape && nextChar === quote && escape !== quote) {
        // 转义字符
        current += quote;
        i++; // 跳过下一个字符
      } else if (char === delimiter && !inQuotes) {
        // 分隔符
        row.push(csvOptions.value.trimWhitespace ? current.trim() : current);
        current = '';
      } else {
        current += char;
      }

      i++;
    }

    // 添加最后一个字段
    row.push(csvOptions.value.trimWhitespace ? current.trim() : current);

    // 类型转换
    if (csvOptions.value.autoDetectTypes) {
      for (let j = 0; j < row.length; j++) {
        row[j] = convertType(row[j]);
      }
    }

    result.push(row);
  }

  return result;
}

function stringifyCsv(data: any[], delimiter: string): string {
  if (data.length === 0) return '';

  const quote = csvOptions.value.quote;
  const escape = csvOptions.value.escape;
  const needsQuote = (value: string) => {
    return value.includes(delimiter) || value.includes(quote) || value.includes('\n') || value.includes('\r');
  };

  const escapeValue = (value: string) => {
    if (escape === quote) {
      return value.replace(new RegExp(quote, 'g'), quote + quote);
    } else {
      return value.replace(new RegExp(quote, 'g'), escape + quote);
    }
  };

  let result = '';

  // 处理对象数组
  if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
    const keys = Object.keys(data[0]);

    // 添加标题行
    if (csvOptions.value.hasHeader) {
      const headerRow = keys
        .map((key) => {
          const value = String(key);
          if (needsQuote(value)) {
            return quote + escapeValue(value) + quote;
          }
          return value;
        })
        .join(delimiter);
      result += headerRow + '\n';
    }

    // 添加数据行
    for (const item of data) {
      const row = keys
        .map((key) => {
          const value = String(item[key] || '');
          if (needsQuote(value)) {
            return quote + escapeValue(value) + quote;
          }
          return value;
        })
        .join(delimiter);
      result += row + '\n';
    }
  } else {
    // 处理二维数组
    for (const row of data) {
      const csvRow = row
        .map((cell: any) => {
          const value = String(cell || '');
          if (needsQuote(value)) {
            return quote + escapeValue(value) + quote;
          }
          return value;
        })
        .join(delimiter);
      result += csvRow + '\n';
    }
  }

  return result.trim();
}

function convertType(value: string): any {
  if (!csvOptions.value.autoDetectTypes) return value;

  // 空值
  if (value === '' || value.toLowerCase() === 'null') return null;

  // 布尔值
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // 数字
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);

  return value;
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObjectKeys(obj[key]);
      });
    return sorted;
  }
  return obj;
}

function detectDelimiter() {
  const text = inputText.value.trim();
  if (!text) return;

  const lines = text.split('\n').slice(0, 5); // 检查前5行
  const delimiters = [',', ';', '\t', '|'];
  const scores: { [key: string]: number } = {};

  for (const delimiter of delimiters) {
    let score = 0;
    let consistency = 0;
    let firstLineCount = -1;

    for (const line of lines) {
      const count = (line.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;

      if (firstLineCount === -1) {
        firstLineCount = count;
      } else if (count === firstLineCount) {
        consistency++;
      }

      score += count;
    }

    // 一致性权重更高
    scores[delimiter] = score + consistency * 10;
  }

  // 找到得分最高的分隔符
  const bestDelimiter = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));

  if (scores[bestDelimiter] > 0) {
    csvOptions.value.delimiter = bestDelimiter;
    autoConvert();
  }
}

function analyzeData(data: string[][], inputFormat: string, outputFormat: string) {
  if (data.length === 0) {
    analysis.value = null;
    return;
  }

  const rowCount = data.length;
  const columnCount = data[0]?.length || 0;
  const hasHeader = csvOptions.value.hasHeader;
  const dataRows = hasHeader ? data.slice(1) : data;
  const headers = hasHeader ? data[0] : data[0]?.map((_, i) => `Column ${i + 1}`) || [];

  const columns = headers.map((header, index) => {
    const columnData = dataRows.map((row) => row[index]).filter((cell) => cell != null && cell !== '');
    const sampleValue = columnData[0] || '';

    // 检测列类型
    let type = 'text';
    if (columnData.length > 0) {
      const numericCount = columnData.filter((cell) => !isNaN(Number(cell))).length;
      const booleanCount = columnData.filter((cell) => typeof cell === 'boolean' || ['true', 'false'].includes(String(cell).toLowerCase())).length;

      if (numericCount / columnData.length > 0.8) {
        type = 'number';
      } else if (booleanCount / columnData.length > 0.8) {
        type = 'boolean';
      }
    }

    return {
      name: header,
      type,
      sampleValue: String(sampleValue)
    };
  });

  const statistics = {
    nullCount: dataRows.flat().filter((cell) => cell == null || cell === '').length,
    numericColumns: columns.filter((col) => col.type === 'number').length,
    textColumns: columns.filter((col) => col.type === 'text').length,
    booleanColumns: columns.filter((col) => col.type === 'boolean').length
  };

  analysis.value = {
    inputFormat: inputFormat.toUpperCase(),
    outputFormat: outputFormat.toUpperCase(),
    rowCount: hasHeader ? rowCount - 1 : rowCount,
    columnCount,
    columns,
    statistics
  };
}

function validateInput() {
  const format = detectFormat();

  if (format === 'json') {
    try {
      const parsed = JSON.parse(inputText.value);
      if (Array.isArray(parsed)) {
        outputText.value = $t('tools.csv-to-json.page.jsonValidWithItems', { count: parsed.length });
      } else {
        outputText.value = $t('tools.csv-to-json.page.jsonValidButNotArray');
      }
    } catch (err) {
      outputText.value = $t('tools.csv-to-json.page.jsonInvalid', { error: err instanceof Error ? err.message : $t('tools.csv-to-json.page.unknownError') });
    }
  } else if (format === 'csv') {
    try {
      const delimiter = csvOptions.value.delimiter === 'custom' ? csvOptions.value.customDelimiter : csvOptions.value.delimiter;
      const parsed = parseCsv(inputText.value, delimiter);
      outputText.value = $t('tools.csv-to-json.page.csvValidWithDimensions', { rows: parsed.length, cols: parsed[0]?.length || 0 });
    } catch (err) {
      outputText.value = $t('tools.csv-to-json.page.csvInvalid', { error: err instanceof Error ? err.message : $t('tools.csv-to-json.page.unknownError') });
    }
  } else {
    outputText.value = $t('tools.csv-to-json.page.unrecognizedInputFormat');
  }
}

function loadSampleCsv() {
  inputText.value = `姓名,年龄,城市,薪资,在职
张三,28,北京,15000,true
李四,32,上海,18000,true
王五,25,广州,12000,false
赵六,35,深圳,22000,true
钱七,29,杭州,16000,true`;

  inputFormat.value = 'csv';
  csvOptions.value.hasHeader = true;
  csvOptions.value.delimiter = ',';
  autoConvert();
}

function loadSampleJson() {
  inputText.value = `[
  {
    "姓名": "张三",
    "年龄": 28,
    "城市": "北京",
    "薪资": 15000,
    "在职": true
  },
  {
    "姓名": "李四",
    "年龄": 32,
    "城市": "上海",
    "薪资": 18000,
    "在职": true
  },
  {
    "姓名": "王五",
    "年龄": 25,
    "城市": "广州",
    "薪资": 12000,
    "在职": false
  }
]`;

  inputFormat.value = 'json';
  autoConvert();
}

function previewTable() {
  if (!outputText.value) return;

  const format = outputFormat.value;
  if (format === 'csv') {
    const delimiter = csvOptions.value.delimiter === 'custom' ? csvOptions.value.customDelimiter : csvOptions.value.delimiter;
    tableData.value = parseCsv(outputText.value, delimiter);
    tableHeaders.value = csvOptions.value.hasHeader && tableData.value.length > 0 ? tableData.value[0] : [];
  } else {
    try {
      const parsed = JSON.parse(outputText.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'object' && !Array.isArray(parsed[0])) {
          // 对象数组
          const keys = Object.keys(parsed[0]);
          tableHeaders.value = keys;
          tableData.value = parsed.map((obj) => keys.map((key) => String(obj[key] || '')));
        } else {
          // 二维数组
          tableData.value = parsed.map((row) => row.map((cell: any) => String(cell || '')));
          tableHeaders.value = [];
        }
      }
    } catch (err) {
      console.error('解析 JSON 失败:', err);
    }
  }

  showTablePreview.value = true;
}

function clearAll() {
  inputText.value = '';
  outputText.value = '';
  error.value = '';
  analysis.value = null;
  detectedFormat.value = null;
  showTablePreview.value = false;
  tableData.value = [];
  tableHeaders.value = [];
}

async function copyOutput() {
  if (!outputText.value) return;

  try {
    await navigator.clipboard.writeText(outputText.value);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function downloadResult() {
  if (!outputText.value) return;

  const extension = outputFormat.value === 'json' ? 'json' : 'csv';
  const filename = `converted-data.${extension}`;
  const mimeType = outputFormat.value === 'json' ? 'application/json' : 'text/csv';

  const blob = new Blob([outputText.value], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    inputText.value = content;

    // 根据文件扩展名设置格式
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'json') {
      inputFormat.value = 'json';
    } else if (extension === 'csv') {
      inputFormat.value = 'csv';
    } else {
      inputFormat.value = 'auto';
    }

    autoConvert();
  };
  reader.readAsText(file);
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    inputText.value = content;

    // 根据文件扩展名设置格式
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'json') {
      inputFormat.value = 'json';
    } else if (extension === 'csv') {
      inputFormat.value = 'csv';
    } else {
      inputFormat.value = 'auto';
    }

    autoConvert();
  };
  reader.readAsText(file);
}

function addToHistory(input: string, output: string, conversion: string) {
  const historyItem: ConversionHistory = {
    input,
    output,
    conversion,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 50) + (input.length > 50 ? '...' : '')
  };

  conversionHistory.value.unshift(historyItem);
  conversionHistory.value = conversionHistory.value.slice(0, 10);
  saveConversionHistory();
}

function loadFromHistory(history: ConversionHistory) {
  inputText.value = history.input;
  outputText.value = history.output;

  // 根据转换类型设置格式
  if (history.conversion.includes('CSV → JSON')) {
    inputFormat.value = 'csv';
    outputFormat.value = 'json';
  } else {
    inputFormat.value = 'json';
    outputFormat.value = 'csv';
  }
}

function clearHistory() {
  conversionHistory.value = [];
  saveConversionHistory();
}

function saveConversionHistory() {
  try {
    localStorage.setItem('csv-json-conversion-history', JSON.stringify(conversionHistory.value));
  } catch (error) {
    console.error('保存转换历史失败:', error);
  }
}

function loadConversionHistory() {
  try {
    const saved = localStorage.getItem('csv-json-conversion-history');
    if (saved) {
      conversionHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载转换历史失败:', error);
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue';

onMounted(() => {
  loadConversionHistory();
});
</script>
