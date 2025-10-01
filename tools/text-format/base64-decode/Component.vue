<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.base64-decode.page.title') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.base64-decode.page.inputTitle') }}</h4>
            <div class="flex gap-2">
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.clear') }}</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="encodedText"
                rows="8"
                :placeholder="$t('tools.base64-decode.page.placeholder')"
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoDecode"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>{{ $t('tools.base64-decode.page.charCount') }}: {{ encodedText.length }}</span>
              <span>{{ $t('tools.base64-decode.page.lineCount') }}: {{ encodedText.split('\n').length }}</span>
              <span v-if="isValidBase64" class="text-green-600">{{ $t('tools.base64-decode.page.validBase64') }}</span>
              <span v-else-if="encodedText.trim()" class="text-red-600">{{ $t('tools.base64-decode.page.invalidBase64') }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.base64-decode.page.options') }}</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.autoDecode" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-decode.page.autoDecode') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removeWhitespace" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-decode.page.removeWhitespace') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.urlSafe" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-decode.page.urlSafe') }}</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.strictMode" type="checkbox" />
                <span class="text-sm">{{ $t('tools.base64-decode.page.strictMode') }}</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-decode.page.outputFormat') }}</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="options.outputFormat" type="radio" value="text" />
                  <span class="text-sm">{{ $t('tools.base64-decode.page.text') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.outputFormat" type="radio" value="hex" />
                  <span class="text-sm">{{ $t('tools.base64-decode.page.hex') }}</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.outputFormat" type="radio" value="binary" />
                  <span class="text-sm">{{ $t('tools.base64-decode.page.binary') }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.base64-decode.page.encoding') }}</label>
              <select v-model="options.encoding" class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="utf-8">UTF-8</option>
                <option value="ascii">ASCII</option>
                <option value="latin1">Latin-1</option>
                <option value="utf-16">UTF-16</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.base64-decode.page.quickActions') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleData" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.loadSample') }}</button>
            <button @click="decodeManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.manualDecode') }}</button>
            <button @click="validateBase64" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.validateFormat') }}</button>
            <button @click="analyzeData" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.analyzeData') }}</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.base64-decode.page.fileOperations') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.b64,.base64" @change="handleFileUpload" class="hidden" />
              {{ $t('tools.base64-decode.page.uploadFile') }}
            </label>
            <button @click="downloadDecoded" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.downloadResult') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.base64-decode.page.outputTitle') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.base64-decode.page.decodedText') }}</h4>
            <div class="flex gap-2">
              <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.copy') }}</button>
              <button @click="encodeResult" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.reEncode') }}</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="decodedText" class="space-y-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto break-all">
                <pre v-if="options.outputFormat === 'text'">{{ decodedText }}</pre>
                <pre v-else-if="options.outputFormat === 'hex'" class="text-green-600">{{ hexOutput }}</pre>
                <pre v-else-if="options.outputFormat === 'binary'" class="text-blue-600">{{ binaryOutput }}</pre>
              </div>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ $t('tools.base64-decode.page.decodedSize') }}: {{ decodedBytes.length }}</span>
                <span>{{ $t('tools.base64-decode.page.charCount') }}: {{ decodedText.length }}</span>
                <span>{{ $t('tools.base64-decode.page.lineCount') }}: {{ decodedText.split('\n').length }}</span>
              </div>
            </div>
            <div v-else-if="error" class="text-center py-8">
              <div class="text-red-600 mb-2">{{ $t('tools.base64-decode.page.decodeFailed') }}</div>
              <div class="text-sm text-gray-500">{{ error }}</div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">{{ $t('tools.base64-decode.page.showResult') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.base64-decode.page.dataAnalysis') }}</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.originalSize') }}:</span>
                  <span class="font-mono">{{ formatBytes(encodedText.length) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.decodedSize') }}:</span>
                  <span class="font-mono">{{ formatBytes(decodedBytes.length) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.compressionRatio') }}:</span>
                  <span class="font-mono">{{ analysis.compressionRatio }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.paddingChars') }}:</span>
                  <span class="font-mono">{{ analysis.paddingChars }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.dataType') }}:</span>
                  <span class="font-mono">{{ analysis.dataType }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.charset') }}:</span>
                  <span class="font-mono">{{ analysis.charset }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.isBinary') }}:</span>
                  <span class="font-mono">{{ analysis.isBinary ? $t('tools.base64-decode.page.yes') : $t('tools.base64-decode.page.no') }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>{{ $t('tools.base64-decode.page.entropy') }}:</span>
                  <span class="font-mono">{{ analysis.entropy.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">{{ $t('tools.base64-decode.page.showAnalysis') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.base64-decode.page.decodeHistory') }}</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.base64-decode.page.clearHistory') }}</button>
          </div>
          <div class="p-4">
            <div v-if="decodeHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in decodeHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ formatBytes(history.size) }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.base64-decode.page.load') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">{{ $t('tools.base64-decode.page.noHistory') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.base64-decode.page.filePreview') }}</h4>
          </div>
          <div class="p-4">
            <div v-if="filePreview" class="space-y-3">
              <div v-if="filePreview.type === 'image'" class="text-center">
                <img :src="filePreview.dataUrl" :alt="$t('tools.base64-decode.page.decodedImage')" class="max-w-full max-h-64 mx-auto rounded border" />
                <div class="text-sm text-gray-500 mt-2">{{ filePreview.info }}</div>
              </div>
              <div v-else-if="filePreview.type === 'json'" class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm max-h-64 overflow-auto">
                <pre>{{ filePreview.content }}</pre>
              </div>
              <div v-else-if="filePreview.type === 'xml'" class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm max-h-64 overflow-auto">
                <pre>{{ filePreview.content }}</pre>
              </div>
              <div v-else class="text-center py-4 text-gray-500">
                <div class="text-lg mb-2">📄</div>
                <div class="text-sm">{{ filePreview.info }}</div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">{{ $t('tools.base64-decode.page.showPreview') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.base64-decode.page.usage') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.base64-decode.page.base64Decode') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.base64-decode.page.standardBase64') }}:</strong> {{ $t('tools.base64-decode.page.standardBase64Desc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.urlSafe') }}:</strong> {{ $t('tools.base64-decode.page.urlSafeDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.paddingChars') }}:</strong> {{ $t('tools.base64-decode.page.paddingCharsDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.autoDetect') }}:</strong> {{ $t('tools.base64-decode.page.autoDetectDesc') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.base64-decode.page.outputFormat') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.base64-decode.page.text') }}:</strong> {{ $t('tools.base64-decode.page.textDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.hex') }}:</strong> {{ $t('tools.base64-decode.page.hexadecimalDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.binary') }}:</strong> {{ $t('tools.base64-decode.page.binaryFormatDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.filePreview') }}:</strong> {{ $t('tools.base64-decode.page.filePreviewDesc') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.base64-decode.page.applicationScenarios') }}</h4>
          <ul class="space-y-1">
            <li>
              • <strong>{{ $t('tools.base64-decode.page.dataTransmission') }}:</strong> {{ $t('tools.base64-decode.page.dataTransmissionDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.fileProcessing') }}:</strong> {{ $t('tools.base64-decode.page.fileProcessingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.apiDebugging') }}:</strong> {{ $t('tools.base64-decode.page.apiDebuggingDesc') }}
            </li>
            <li>
              • <strong>{{ $t('tools.base64-decode.page.dataAnalysis') }}:</strong> {{ $t('tools.base64-decode.page.dataAnalysisDesc') }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface DecodeOptions {
  autoDecode: boolean;
  removeWhitespace: boolean;
  urlSafe: boolean;
  strictMode: boolean;
  outputFormat: 'text' | 'hex' | 'binary';
  encoding: string;
}

interface Analysis {
  compressionRatio: number;
  paddingChars: number;
  dataType: string;
  charset: string;
  isBinary: boolean;
  entropy: number;
}

interface DecodeHistory {
  encoded: string;
  decoded: string;
  timestamp: string;
  preview: string;
  size: number;
}

interface FilePreview {
  type: 'image' | 'json' | 'xml' | 'text' | 'binary';
  content?: string;
  dataUrl?: string;
  info: string;
}

const encodedText = ref('');
const decodedText = ref('');
const decodedBytes = ref<Uint8Array>(new Uint8Array());
const error = ref('');

const options = ref<DecodeOptions>({
  autoDecode: true,
  removeWhitespace: true,
  urlSafe: false,
  strictMode: false,
  outputFormat: 'text',
  encoding: 'utf-8'
});

const decodeHistory = ref<DecodeHistory[]>([]);
const filePreview = ref<FilePreview | null>(null);

const isValidBase64 = computed(() => {
  if (!encodedText.value.trim()) return false;
  return validateBase64Format(encodedText.value);
});

const hexOutput = computed(() => {
  if (!decodedBytes.value.length) return '';
  return Array.from(decodedBytes.value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ');
});

const binaryOutput = computed(() => {
  if (!decodedBytes.value.length) return '';
  return Array.from(decodedBytes.value)
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ');
});

const analysis = computed((): Analysis | null => {
  if (!encodedText.value.trim() || !decodedBytes.value.length) return null;

  const originalSize = encodedText.value.length;
  const decodedSize = decodedBytes.value.length;
  const compressionRatio = Math.round(((originalSize - decodedSize) / originalSize) * 100);

  const paddingChars = (encodedText.value.match(/=/g) || []).length;

  // Detect data type
  let dataType = 'Unknown';
  const firstBytes = Array.from(decodedBytes.value.slice(0, 8));

  if (firstBytes[0] === 0xff && firstBytes[1] === 0xd8) {
    dataType = 'JPEG Image';
  } else if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4e && firstBytes[3] === 0x47) {
    dataType = 'PNG Image';
  } else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && firstBytes[2] === 0x46) {
    dataType = 'GIF Image';
  } else if (firstBytes[0] === 0x25 && firstBytes[1] === 0x50 && firstBytes[2] === 0x44 && firstBytes[3] === 0x46) {
    dataType = 'PDF Document';
  } else if (decodedText.value.trim().startsWith('{') || decodedText.value.trim().startsWith('[')) {
    dataType = 'JSON Data';
  } else if (decodedText.value.trim().startsWith('<')) {
    dataType = 'XML/HTML Data';
  } else if (/^[\x20-\x7E\s]*$/.test(decodedText.value)) {
    dataType = 'Text Data';
  } else {
    dataType = 'Binary Data';
  }

  // Detect character set
  const charset = detectCharset(decodedBytes.value);

  // Detect if it's binary data
  const isBinary = decodedBytes.value.some((byte) => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13);

  // Calculate entropy
  const entropy = calculateEntropy(decodedBytes.value);

  return {
    compressionRatio,
    paddingChars,
    dataType,
    charset,
    isBinary,
    entropy
  };
});

watch(
  [() => options.value],
  () => {
    if (encodedText.value && options.value.autoDecode) {
      performDecode();
    }
  },
  { deep: true }
);

function autoDecode() {
  if (!options.value.autoDecode || !encodedText.value.trim()) {
    clearResults();
    return;
  }

  performDecode();
}

function performDecode() {
  if (!encodedText.value.trim()) {
    clearResults();
    return;
  }

  try {
    error.value = '';

    let input = encodedText.value;

    // Remove whitespace
    if (options.value.removeWhitespace) {
      input = input.replace(/\s/g, '');
    }

    // URL safe mode conversion
    if (options.value.urlSafe) {
      input = input.replace(/-/g, '+').replace(/_/g, '/');
    }

    // Validate Base64 format
    if (options.value.strictMode && !validateBase64Format(input)) {
      throw new Error($t('tools.base64-decode.page.invalidBase64Format'));
    }

    // Decode
    const decoded = atob(input);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }

    decodedBytes.value = bytes;

    // Convert text based on encoding format
    decodedText.value = decodeToText(bytes, options.value.encoding);

    // Generate file preview
    generateFilePreview(bytes, decodedText.value);

    // Add to history
    addToHistory(encodedText.value, decodedText.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : $t('tools.base64-decode.page.decodeFailed');
    decodedText.value = '';
    decodedBytes.value = new Uint8Array();
    filePreview.value = null;
  }
}

function validateBase64Format(text: string): boolean {
  // Remove whitespace
  const cleaned = text.replace(/\s/g, '');

  // Check if length is multiple of 4
  if (cleaned.length % 4 !== 0) return false;

  // Check if characters are valid
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafeRegex = /^[A-Za-z0-9\-_]*={0,2}$/;

  return base64Regex.test(cleaned) || urlSafeRegex.test(cleaned);
}

function decodeToText(bytes: Uint8Array, encoding: string): string {
  try {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(bytes);
  } catch {
    // If decoding fails, try UTF-8
    try {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch {
      // If still fails, return original string
      return String.fromCharCode(...bytes);
    }
  }
}

function detectCharset(bytes: Uint8Array): string {
  // Simple character set detection
  const hasHighBytes = bytes.some((byte) => byte > 127);

  if (!hasHighBytes) {
    return 'ASCII';
  }

  // Detect UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'UTF-8 (BOM)';
  }

  // Detect UTF-16 BOM
  if (bytes.length >= 2) {
    if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) {
      return 'UTF-16 (BOM)';
    }
  }

  return 'UTF-8';
}

function calculateEntropy(bytes: Uint8Array): number {
  const frequency = new Array(256).fill(0);

  for (const byte of bytes) {
    frequency[byte]++;
  }

  let entropy = 0;
  const length = bytes.length;

  for (const count of frequency) {
    if (count > 0) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
  }

  return entropy;
}

function generateFilePreview(bytes: Uint8Array, text: string) {
  filePreview.value = null;

  // Detect image
  if (bytes.length > 8) {
    const header = Array.from(bytes.slice(0, 8));

    if (
      (header[0] === 0xff && header[1] === 0xd8) || // JPEG
      (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) || // PNG
      (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46)
    ) {
      // GIF

      const blob = new Blob([bytes]);
      const dataUrl = URL.createObjectURL(blob);

      filePreview.value = {
        type: 'image',
        dataUrl,
        info: `${$t('tools.base64-decode.page.imageFile')} (${formatBytes(bytes.length)})`
      };
      return;
    }
  }

  // Detect JSON
  try {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      JSON.parse(trimmed);
      filePreview.value = {
        type: 'json',
        content: JSON.stringify(JSON.parse(trimmed), null, 2),
        info: `${$t('tools.base64-decode.page.jsonData')} (${formatBytes(bytes.length)})`
      };
      return;
    }
  } catch {
    // Not valid JSON
  }

  // Detect XML
  if (text.trim().startsWith('<') && text.trim().includes('>')) {
    filePreview.value = {
      type: 'xml',
      content: text,
      info: `${$t('tools.base64-decode.page.xmlHtmlData')} (${formatBytes(bytes.length)})`
    };
    return;
  }

  // Detect text
  const isBinary = bytes.some((byte) => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13);
  if (!isBinary) {
    filePreview.value = {
      type: 'text',
      content: text,
      info: `${$t('tools.base64-decode.page.textData')} (${formatBytes(bytes.length)})`
    };
  } else {
    filePreview.value = {
      type: 'binary',
      info: `${$t('tools.base64-decode.page.binaryData')} (${formatBytes(bytes.length)})`
    };
  }
}

function clearResults() {
  decodedText.value = '';
  decodedBytes.value = new Uint8Array();
  error.value = '';
  filePreview.value = null;
}

function loadSampleData() {
  // Example: Encoded JSON data
  encodedText.value =
    'eyJuYW1lIjoi5byg5LiJIiwiYWdlIjoyNSwiZW1haWwiOiJ6aGFuZ3NhbkBleGFtcGxlLmNvbSIsImhvYmJpZXMiOlsi6ZiF6K+7Iiwi5ri45oiPIiwi5peF6KGMIl0sImFkZHJlc3MiOnsiY2l0eSI6IuWMl+S6rCIsImNvdW50cnkiOiLkuK3lm70ifX0=';

  if (options.value.autoDecode) {
    performDecode();
  }
}

function decodeManually() {
  performDecode();
}

function validateBase64() {
  const isValid = validateBase64Format(encodedText.value);
  const message = isValid ? $t('tools.base64-decode.page.base64FormatValid') : $t('tools.base64-decode.page.base64FormatInvalid');
  alert(message);
}

function analyzeData() {
  if (!analysis.value) {
    alert($t('tools.base64-decode.page.pleaseInputBase64'));
    return;
  }

  const stats = analysis.value;
  const message = `${$t('tools.base64-decode.page.dataAnalysisResults')}:
${$t('tools.base64-decode.page.dataType')}: ${stats.dataType}
${$t('tools.base64-decode.page.charset')}: ${stats.charset}
${$t('tools.base64-decode.page.isBinary')}: ${stats.isBinary ? $t('tools.base64-decode.page.yes') : $t('tools.base64-decode.page.no')}
${$t('tools.base64-decode.page.compressionRatio')}: ${stats.compressionRatio}%
${$t('tools.base64-decode.page.paddingChars')}: ${stats.paddingChars}
${$t('tools.base64-decode.page.entropy')}: ${stats.entropy.toFixed(2)}
${$t('tools.base64-decode.page.originalSize')}: ${formatBytes(encodedText.value.length)}
${$t('tools.base64-decode.page.decodedSize')}: ${formatBytes(decodedBytes.value.length)}`;

  alert(message);
}

function clearAll() {
  encodedText.value = '';
  clearResults();
}

async function copyResult() {
  if (!decodedText.value) return;

  try {
    await navigator.clipboard.writeText(decodedText.value);
    // Success message can be added here
  } catch (error) {
    console.error($t('tools.base64-decode.page.copyFailed'), error);
  }
}

function encodeResult() {
  if (!decodedText.value) return;

  try {
    const encoded = btoa(decodedText.value);
    encodedText.value = encoded;
  } catch (error) {
    console.error($t('tools.base64-decode.page.encodeFailed'), error);
  }
}

function downloadDecoded() {
  if (!decodedBytes.value.length) return;

  const blob = new Blob([decodedBytes.value]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'decoded-data.bin';
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
    encodedText.value = content;

    if (options.value.autoDecode) {
      performDecode();
    }
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
    encodedText.value = content;

    if (options.value.autoDecode) {
      performDecode();
    }
  };
  reader.readAsText(file);
}

function addToHistory(encoded: string, decoded: string) {
  const historyItem: DecodeHistory = {
    encoded,
    decoded,
    timestamp: new Date().toLocaleString(),
    preview: decoded.slice(0, 50) + (decoded.length > 50 ? '...' : ''),
    size: decodedBytes.value.length
  };

  decodeHistory.value.unshift(historyItem);
  decodeHistory.value = decodeHistory.value.slice(0, 10);
  saveDecodeHistory();
}

function loadFromHistory(history: DecodeHistory) {
  encodedText.value = history.encoded;
  decodedText.value = history.decoded;
}

function clearHistory() {
  decodeHistory.value = [];
  saveDecodeHistory();
}

function saveDecodeHistory() {
  try {
    localStorage.setItem('base64-decode-history', JSON.stringify(decodeHistory.value));
  } catch (error) {
    console.error($t('tools.base64-decode.page.saveHistoryFailed'), error);
  }
}

function loadDecodeHistory() {
  try {
    const saved = localStorage.getItem('base64-decode-history');
    if (saved) {
      decodeHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error($t('tools.base64-decode.page.loadHistoryFailed'), error);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Load history when component mounts
import { onMounted } from 'vue';

onMounted(() => {
  loadDecodeHistory();
});
</script>
