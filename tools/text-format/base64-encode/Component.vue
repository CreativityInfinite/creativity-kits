<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.base64-encode.page.title') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.base64-encode.page.inputTitle') }}</h4>
            <div class="flex gap-2">
              <button @click="encode" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.encode') }}</button>
              <button @click="decode" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.decode') }}</button>
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.clear') }}</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-encode.page.operationMode') }}</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="mode" type="radio" value="text" @change="handleModeChange" />
                  <span class="text-sm">{{ $t('tools.base64-encode.page.textMode') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="mode" type="radio" value="file" @change="handleModeChange" />
                  <span class="text-sm">{{ $t('tools.base64-encode.page.fileMode') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="mode" type="radio" value="url" @change="handleModeChange" />
                  <span class="text-sm">{{ $t('tools.base64-encode.page.urlMode') }}</span>
                </label>
              </div>
            </div>

            <div v-if="mode === 'text'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-encode.page.inputText') }}</label>
              <textarea
                v-model="inputText"
                rows="8"
                :placeholder="$t('tools.base64-encode.page.placeholder')"
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoDetectAndProcess"
              ></textarea>
            </div>

            <div v-if="mode === 'file'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-encode.page.selectFile') }}</label>
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" />
                <div class="text-center">
                  <div class="mb-2">
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <button @click="$refs.fileInput.click()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">{{ $t('tools.base64-encode.page.selectFile') }}</button>
                  <p class="mt-2 text-sm text-gray-500">{{ $t('tools.base64-encode.page.dragFile') }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ $t('tools.base64-encode.page.fileLimit') }}</p>
                </div>
              </div>

              <div v-if="selectedFile" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-sm">{{ selectedFile.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }} - {{ selectedFile.type || $t('tools.base64-encode.page.unknownType') }}</div>
                  </div>
                  <button @click="clearFile" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.base64-encode.page.remove') }}</button>
                </div>
              </div>
            </div>

            <div v-if="mode === 'url'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-encode.page.inputUrl') }}</label>
              <div class="flex gap-2">
                <input v-model="inputUrl" type="url" placeholder="https://example.com/image.jpg" class="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <button @click="fetchFromUrl" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.fetch') }}</button>
              </div>
              <div class="text-xs text-gray-500 mt-1">{{ $t('tools.base64-encode.page.urlSupport') }}</div>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span v-if="mode === 'text'">{{ $t('tools.base64-encode.page.charCount') }}: {{ inputText.length }}</span>
              <span v-if="inputEncoding">{{ $t('tools.base64-encode.page.encoding') }}: {{ inputEncoding }}</span>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span>⚠️</span>
                <span class="font-medium">{{ $t('tools.base64-encode.page.processError') }}</span>
              </div>
              <div class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.base64-encode.page.options') }}</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.urlSafe" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-encode.page.urlSafe') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removePadding" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-encode.page.removePadding') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.lineBreaks" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-encode.page.addLineBreaks') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.autoDetect" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-encode.page.autoDetect') }}</span>
              </label>
            </div>

            <div v-if="options.lineBreaks">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-encode.page.lineLength') }}: {{ options.lineLength }}</label>
              <input v-model.number="options.lineLength" type="range" min="32" max="128" step="8" class="w-full" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>32</span>
                <span>128</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.base64-encode.page.quickActions') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleText" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.loadSample') }}</button>
            <button @click="swapInputOutput" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.swapContent') }}</button>
            <button @click="validateBase64" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.validateFormat') }}</button>
            <button @click="generateDataUrl" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.generateDataUrl') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.base64-encode.page.outputTitle') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.base64-encode.page.outputResult') }}</h4>
            <div class="flex gap-2">
              <button @click="copyOutput" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.copy') }}</button>
              <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.download') }}</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="outputText" class="space-y-3">
              <textarea v-model="outputText" rows="8" readonly class="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>

              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ $t('tools.base64-encode.page.charCount') }}: {{ outputText.length }}</span>
                <span>{{ $t('tools.base64-encode.page.lineCount') }}: {{ outputText.split('\n').length }}</span>
                <span v-if="compressionRatio">{{ $t('tools.base64-encode.page.compressionRatio') }}: {{ compressionRatio }}%</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">{{ $t('tools.base64-encode.page.showResult') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.base64-encode.page.contentAnalysis') }}</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.base64-encode.page.contentType') }}</div>
                  <div class="font-medium">{{ analysis.type }}</div>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.base64-encode.page.encodingFormat') }}</div>
                  <div class="font-medium">{{ analysis.encoding }}</div>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.base64-encode.page.originalSize') }}</div>
                  <div class="font-medium">{{ analysis.originalSize }}</div>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.base64-encode.page.encodedSize') }}</div>
                  <div class="font-medium">{{ analysis.encodedSize }}</div>
                </div>
              </div>

              <div v-if="analysis.isValid !== null" class="p-3 rounded" :class="analysis.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                <div class="flex items-center gap-2">
                  <span :class="analysis.isValid ? 'text-green-500' : 'text-red-500'">
                    {{ analysis.isValid ? '✓' : '✗' }}
                  </span>
                  <span class="font-medium">{{ analysis.isValid ? $t('tools.base64-encode.page.validFormat') : $t('tools.base64-encode.page.invalidFormat') }}</span>
                </div>
                <div v-if="analysis.validationError" class="text-sm text-red-600 dark:text-red-400 mt-1">
                  {{ analysis.validationError }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">{{ $t('tools.base64-encode.page.showAnalysis') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.base64-encode.page.preview') }}</h4>
          </div>
          <div class="p-4">
            <div v-if="preview" class="space-y-3">
              <div v-if="preview.type === 'image'" class="text-center">
                <img :src="preview.dataUrl" :alt="preview.filename" class="max-w-full max-h-64 mx-auto rounded border" />
                <div class="text-sm text-gray-500 mt-2">{{ preview.filename }}</div>
              </div>

              <div v-else-if="preview.type === 'text'" class="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                <div class="font-mono text-sm whitespace-pre-wrap">{{ preview.content }}</div>
              </div>

              <div v-else class="text-center py-4">
                <div class="text-4xl mb-2">📄</div>
                <div class="font-medium">{{ preview.filename }}</div>
                <div class="text-sm text-gray-500">{{ preview.mimeType }}</div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">{{ $t('tools.base64-encode.page.showPreview') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.base64-encode.page.processHistory') }}</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.base64-encode.page.clearHistory') }}</button>
          </div>
          <div class="p-4">
            <div v-if="processHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in processHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.operation }} - {{ history.timestamp }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.base64-encode.page.load') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">{{ $t('tools.base64-encode.page.noHistory') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.base64-encode.page.usage') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.base64-encode.page.encodingFeatures') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.base64-encode.page.textEncoding') }}:</strong> {{ $t('tools.base64-encode.page.textEncodingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.fileEncoding') }}:</strong> {{ $t('tools.base64-encode.page.fileEncodingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.urlEncoding') }}:</strong> {{ $t('tools.base64-encode.page.urlEncodingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.dataUrlGeneration') }}:</strong> {{ $t('tools.base64-encode.page.dataUrlDesc') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.base64-encode.page.decodingFeatures') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.base64-encode.page.autoDetection') }}:</strong> {{ $t('tools.base64-encode.page.autoDetectionDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.formatValidation') }}:</strong> {{ $t('tools.base64-encode.page.formatValidationDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.contentPreview') }}:</strong> {{ $t('tools.base64-encode.page.contentPreviewDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.fileDownload') }}:</strong> {{ $t('tools.base64-encode.page.fileDownloadDesc') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.base64-encode.page.advancedOptions') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.base64-encode.page.urlSafeOption') }}:</strong> {{ $t('tools.base64-encode.page.urlSafeOptionDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.lineBreakControl') }}:</strong> {{ $t('tools.base64-encode.page.lineBreakControlDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.paddingHandling') }}:</strong> {{ $t('tools.base64-encode.page.paddingHandlingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-encode.page.batchProcessing') }}:</strong> {{ $t('tools.base64-encode.page.batchProcessingDesc') }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Analysis {
  type: string;
  encoding: string;
  originalSize: string;
  encodedSize: string;
  isValid: boolean | null;
  validationError?: string;
}

interface Preview {
  type: 'image' | 'text' | 'file';
  content?: string;
  dataUrl?: string;
  filename?: string;
  mimeType?: string;
}

interface ProcessHistory {
  input: string;
  output: string;
  operation: string;
  timestamp: string;
  preview: string;
}

const mode = ref<'text' | 'file' | 'url'>('text');
const inputText = ref('');
const outputText = ref('');
const inputUrl = ref('');
const selectedFile = ref<File | null>(null);
const error = ref('');
const inputEncoding = ref('');

const options = ref({
  urlSafe: false,
  removePadding: false,
  lineBreaks: false,
  lineLength: 64,
  autoDetect: true
});

const analysis = ref<Analysis | null>(null);
const preview = ref<Preview | null>(null);
const processHistory = ref<ProcessHistory[]>([]);

const compressionRatio = computed(() => {
  if (!inputText.value || !outputText.value) return null;
  const originalSize = new Blob([inputText.value]).size;
  const encodedSize = new Blob([outputText.value]).size;
  if (originalSize === 0) return null;
  return Math.round(((encodedSize - originalSize) / originalSize) * 100);
});

watch([() => options.value.urlSafe, () => options.value.removePadding, () => options.value.lineBreaks, () => options.value.lineLength], () => {
  if (inputText.value && outputText.value) {
    // Re-process current content
    if (isBase64(inputText.value)) {
      decode();
    } else {
      encode();
    }
  }
});

function handleModeChange() {
  clearAll();
}

function encode() {
  error.value = '';

  try {
    let input = '';

    if (mode.value === 'text') {
      input = inputText.value;
    } else if (mode.value === 'file' && selectedFile.value) {
      // File encoding will be handled in handleFileSelect
      return;
    }

    if (!input) {
      error.value = t('tools.base64-encode.page.needInputEncode');
      return;
    }

    let encoded = btoa(unescape(encodeURIComponent(input)));

    if (options.value.urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
    }

    if (options.value.removePadding) {
      encoded = encoded.replace(/=/g, '');
    }

    if (options.value.lineBreaks) {
      encoded = encoded.replace(new RegExp(`(.{${options.value.lineLength}})`, 'g'), '$1\n');
    }

    outputText.value = encoded;
    analyzeContent(input, encoded, 'encode');
    addToHistory(input, encoded, t('tools.base64-encode.page.encodeOp'));
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('tools.base64-encode.page.encodeFailed');
  }
}

function decode() {
  error.value = '';

  try {
    let input = inputText.value.trim();

    if (!input) {
      error.value = t('tools.base64-encode.page.needInputDecode');
      return;
    }

    // Clean input
    input = input.replace(/\s/g, ''); // Remove all whitespace characters

    if (options.value.urlSafe) {
      input = input.replace(/-/g, '+').replace(/_/g, '/');
    }

    // Add padding
    while (input.length % 4) {
      input += '=';
    }

    const decoded = decodeURIComponent(escape(atob(input)));
    outputText.value = decoded;

    analyzeContent(input, decoded, 'decode');
    generatePreview(decoded, input);
    addToHistory(input, decoded, t('tools.base64-encode.page.decodeOp'));
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('tools.base64-encode.page.decodeFailed');
  }
}

function autoDetectAndProcess() {
  if (!options.value.autoDetect) return;

  const input = inputText.value.trim();
  if (!input) {
    outputText.value = '';
    analysis.value = null;
    preview.value = null;
    return;
  }

  if (isBase64(input)) {
    decode();
  } else {
    encode();
  }
}

function isBase64(str: string): boolean {
  if (!str) return false;

  // Remove whitespace characters
  str = str.replace(/\s/g, '');

  // Check length
  if (str.length % 4 !== 0) return false;

  // Check characters
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafeBase64Regex = /^[A-Za-z0-9_-]*={0,2}$/;

  return base64Regex.test(str) || urlSafeBase64Regex.test(str);
}

function validateBase64() {
  const input = inputText.value.trim();

  if (!input) {
    error.value = t('tools.base64-encode.page.needInputValidate');
    return;
  }

  const isValid = isBase64(input);

  analysis.value = {
    type: t('tools.base64-encode.page.base64Validation'),
    encoding: 'Base64',
    originalSize: formatBytes(input.length),
    encodedSize: '-',
    isValid,
    validationError: isValid ? undefined : t('tools.base64-encode.page.invalidFormat')
  };

  outputText.value = isValid ? t('tools.base64-encode.page.validFormatFull') : t('tools.base64-encode.page.invalidFormatFull');
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    error.value = t('tools.base64-encode.page.fileSizeExceeded');
    return;
  }

  selectedFile.value = file;

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1]; // Remove data:mime;base64, prefix

      let encoded = base64;

      if (options.value.urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
      }

      if (options.value.removePadding) {
        encoded = encoded.replace(/=/g, '');
      }

      if (options.value.lineBreaks) {
        encoded = encoded.replace(new RegExp(`(.{${options.value.lineLength}})`, 'g'), '$1\n');
      }

      outputText.value = encoded;
      analyzeContent(file.name, encoded, 'encode');
      addToHistory(file.name, encoded, t('tools.base64-encode.page.fileEncoding'));
    };
    reader.readAsDataURL(file);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('tools.base64-encode.page.fileReadFailed');
  }
}

function clearFile() {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function fetchFromUrl() {
  if (!inputUrl.value) {
    error.value = t('tools.base64-encode.page.needValidUrl');
    return;
  }

  try {
    const response = await fetch(inputUrl.value);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];

      let encoded = base64;

      if (options.value.urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
      }

      if (options.value.removePadding) {
        encoded = encoded.replace(/=/g, '');
      }

      if (options.value.lineBreaks) {
        encoded = encoded.replace(new RegExp(`(.{${options.value.lineLength}})`, 'g'), '$1\n');
      }

      outputText.value = encoded;
      analyzeContent(inputUrl.value, encoded, 'encode');
      addToHistory(inputUrl.value, encoded, t('tools.base64-encode.page.urlEncoding'));
    };

    reader.readAsDataURL(blob);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('tools.base64-encode.page.urlFetchFailed');
  }
}

function generateDataUrl() {
  if (!outputText.value) {
    error.value = t('tools.base64-encode.page.needEncodeFirst');
    return;
  }

  let mimeType = 'text/plain';

  if (selectedFile.value) {
    mimeType = selectedFile.value.type || 'application/octet-stream';
  }

  const dataUrl = `data:${mimeType};base64,${outputText.value.replace(/\s/g, '')}`;
  outputText.value = dataUrl;

  addToHistory(inputText.value || selectedFile.value?.name || '', dataUrl, 'Data URL');
}

function analyzeContent(input: string, output: string, operation: 'encode' | 'decode') {
  const inputSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;

  analysis.value = {
    type: operation === 'encode' ? t('tools.base64-encode.page.textFile') : t('tools.base64-encode.page.decodedContent'),
    encoding: 'Base64',
    originalSize: formatBytes(inputSize),
    encodedSize: formatBytes(outputSize),
    isValid: operation === 'decode' ? isBase64(input) : null
  };
}

function generatePreview(decoded: string, base64: string) {
  preview.value = null;

  try {
    // Try to detect content type
    if (decoded.startsWith('data:')) {
      // Data URL
      const [header, data] = decoded.split(',');
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'text/plain';

      if (mimeType.startsWith('image/')) {
        preview.value = {
          type: 'image',
          dataUrl: decoded,
          filename: 'decoded-image',
          mimeType
        };
      }
    } else if (decoded.length < 1000 && /^[\x20-\x7E\s]*$/.test(decoded)) {
      // Printable ASCII text
      preview.value = {
        type: 'text',
        content: decoded
      };
    } else {
      // Try as image
      const dataUrl = `data:image/png;base64,${base64.replace(/\s/g, '')}`;
      preview.value = {
        type: 'image',
        dataUrl,
        filename: 'decoded-file',
        mimeType: 'image/png'
      };
    }
  } catch (err) {
    // Preview generation failed, don't show preview
  }
}

function loadSampleText() {
  inputText.value = 'Hello, World! ' + t('tools.base64-encode.page.sampleText') + '\n' + t('tools.base64-encode.page.sampleTextDesc');
  autoDetectAndProcess();
}

function swapInputOutput() {
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  autoDetectAndProcess();
}

function clearAll() {
  inputText.value = '';
  outputText.value = '';
  inputUrl.value = '';
  selectedFile.value = null;
  error.value = '';
  analysis.value = null;
  preview.value = null;
  inputEncoding.value = '';
}

async function copyOutput() {
  if (!outputText.value) return;

  try {
    await navigator.clipboard.writeText(outputText.value);
    // Success prompt can be added here
  } catch (error) {
    console.error(t('tools.base64-encode.page.copyFailed'), error);
  }
}

function downloadResult() {
  if (!outputText.value) return;

  let filename = 'base64-result.txt';
  let content = outputText.value;
  let mimeType = 'text/plain';

  if (analysis.value?.type === t('tools.base64-encode.page.decodedContent') && preview.value?.type === 'image') {
    // Download decoded image
    const link = document.createElement('a');
    link.href = preview.value.dataUrl!;
    link.download = 'decoded-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatFileSize(size: number): string {
  return formatBytes(size);
}

function addToHistory(input: string, output: string, operation: string) {
  const historyItem: ProcessHistory = {
    input,
    output,
    operation,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 30) + (input.length > 30 ? '...' : '')
  };

  processHistory.value.unshift(historyItem);
  processHistory.value = processHistory.value.slice(0, 10);
  saveProcessHistory();
}

function loadFromHistory(history: ProcessHistory) {
  inputText.value = history.input;
  outputText.value = history.output;
  autoDetectAndProcess();
}

function clearHistory() {
  processHistory.value = [];
  saveProcessHistory();
}

function saveProcessHistory() {
  try {
    localStorage.setItem('base64-process-history', JSON.stringify(processHistory.value));
  } catch (error) {
    console.error(t('tools.base64-encode.page.saveFailed'), error);
  }
}

function loadProcessHistory() {
  try {
    const saved = localStorage.getItem('base64-process-history');
    if (saved) {
      processHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error(t('tools.base64-encode.page.loadFailed'), error);
  }
}

// Load history when component mounts
import { onMounted } from 'vue';
const fileInput = ref<HTMLInputElement>();

onMounted(() => {
  loadProcessHistory();
});
</script>
