<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Base64 编码/解码工具</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">输入内容</h4>
            <div class="flex gap-2">
              <button @click="encode" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">编码</button>
              <button @click="decode" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">解码</button>
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">操作模式</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="mode" type="radio" value="text" @change="handleModeChange" />
                  <span class="text-sm">文本模式</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="mode" type="radio" value="file" @change="handleModeChange" />
                  <span class="text-sm">文件模式</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="mode" type="radio" value="url" @change="handleModeChange" />
                  <span class="text-sm">URL 模式</span>
                </label>
              </div>
            </div>

            <div v-if="mode === 'text'">
              <label class="block text-sm font-medium mb-2">输入文本</label>
              <textarea
                v-model="inputText"
                rows="8"
                placeholder="在此输入要编码或解码的文本..."
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoDetectAndProcess"
              ></textarea>
            </div>

            <div v-if="mode === 'file'">
              <label class="block text-sm font-medium mb-2">选择文件</label>
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
                  <button @click="$refs.fileInput.click()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">选择文件</button>
                  <p class="mt-2 text-sm text-gray-500">或拖拽文件到此处</p>
                  <p class="text-xs text-gray-400 mt-1">支持所有文件类型，最大 10MB</p>
                </div>
              </div>

              <div v-if="selectedFile" class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-sm">{{ selectedFile.name }}</div>
                    <div class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }} - {{ selectedFile.type || '未知类型' }}</div>
                  </div>
                  <button @click="clearFile" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">移除</button>
                </div>
              </div>
            </div>

            <div v-if="mode === 'url'">
              <label class="block text-sm font-medium mb-2">输入 URL</label>
              <div class="flex gap-2">
                <input v-model="inputUrl" type="url" placeholder="https://example.com/image.jpg" class="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <button @click="fetchFromUrl" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">获取</button>
              </div>
              <div class="text-xs text-gray-500 mt-1">支持图片、文本等资源的 URL</div>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span v-if="mode === 'text'">字符数: {{ inputText.length }}</span>
              <span v-if="inputEncoding">编码: {{ inputEncoding }}</span>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span>⚠️</span>
                <span class="font-medium">处理错误</span>
              </div>
              <div class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">编码选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.urlSafe" type="checkbox" />
                <span class="text-sm">URL 安全编码</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removePadding" type="checkbox" />
                <span class="text-sm">移除填充字符</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.lineBreaks" type="checkbox" />
                <span class="text-sm">添加换行符</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.autoDetect" type="checkbox" />
                <span class="text-sm">自动检测</span>
              </label>
            </div>

            <div v-if="options.lineBreaks">
              <label class="block text-sm font-medium mb-2">换行长度: {{ options.lineLength }}</label>
              <input v-model.number="options.lineLength" type="range" min="32" max="128" step="8" class="w-full" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>32</span>
                <span>128</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleText" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="swapInputOutput" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">交换内容</button>
            <button @click="validateBase64" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">验证格式</button>
            <button @click="generateDataUrl" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">生成 Data URL</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">处理结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">输出结果</h4>
            <div class="flex gap-2">
              <button @click="copyOutput" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="outputText" class="space-y-3">
              <textarea v-model="outputText" rows="8" readonly class="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>

              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>字符数: {{ outputText.length }}</span>
                <span>行数: {{ outputText.split('\n').length }}</span>
                <span v-if="compressionRatio">压缩率: {{ compressionRatio }}%</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入内容后将显示编码或解码结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">内容分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">内容类型</div>
                  <div class="font-medium">{{ analysis.type }}</div>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">编码格式</div>
                  <div class="font-medium">{{ analysis.encoding }}</div>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">原始大小</div>
                  <div class="font-medium">{{ analysis.originalSize }}</div>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">编码大小</div>
                  <div class="font-medium">{{ analysis.encodedSize }}</div>
                </div>
              </div>

              <div v-if="analysis.isValid !== null" class="p-3 rounded" :class="analysis.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
                <div class="flex items-center gap-2">
                  <span :class="analysis.isValid ? 'text-green-500' : 'text-red-500'">
                    {{ analysis.isValid ? '✓' : '✗' }}
                  </span>
                  <span class="font-medium">{{ analysis.isValid ? 'Base64 格式有效' : 'Base64 格式无效' }}</span>
                </div>
                <div v-if="analysis.validationError" class="text-sm text-red-600 dark:text-red-400 mt-1">
                  {{ analysis.validationError }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">输入内容后将显示分析结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">预览</h4>
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
            <div v-else class="text-center py-4 text-gray-500">解码文件后将显示预览</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">处理历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="processHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in processHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.operation }} - {{ history.timestamp }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无处理历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">Base64 编码</h4>
          <ul class="space-y-1">
            <li>• <strong>文本编码:</strong> 将文本转换为 Base64 格式</li>
            <li>• <strong>文件编码:</strong> 将文件内容编码为 Base64</li>
            <li>• <strong>URL 编码:</strong> 从网络资源获取并编码</li>
            <li>• <strong>Data URL:</strong> 生成可直接使用的 Data URL</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">解码功能</h4>
          <ul class="space-y-1">
            <li>• <strong>自动检测:</strong> 自动识别 Base64 内容</li>
            <li>• <strong>格式验证:</strong> 检查 Base64 格式是否正确</li>
            <li>• <strong>内容预览:</strong> 支持图片、文本等预览</li>
            <li>• <strong>文件下载:</strong> 解码后可下载原始文件</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">高级选项</h4>
          <ul class="space-y-1">
            <li>• <strong>URL 安全:</strong> 使用 URL 安全的 Base64 字符</li>
            <li>• <strong>换行控制:</strong> 控制输出格式的换行</li>
            <li>• <strong>填充处理:</strong> 控制 = 填充字符</li>
            <li>• <strong>批量处理:</strong> 支持多个文件处理</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

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
    // 重新处理当前内容
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
      // 文件编码将在 handleFileSelect 中处理
      return;
    }

    if (!input) {
      error.value = '请输入要编码的内容';
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
    addToHistory(input, encoded, '编码');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '编码失败';
  }
}

function decode() {
  error.value = '';

  try {
    let input = inputText.value.trim();

    if (!input) {
      error.value = '请输入要解码的 Base64 内容';
      return;
    }

    // 清理输入
    input = input.replace(/\s/g, ''); // 移除所有空白字符

    if (options.value.urlSafe) {
      input = input.replace(/-/g, '+').replace(/_/g, '/');
    }

    // 添加填充
    while (input.length % 4) {
      input += '=';
    }

    const decoded = decodeURIComponent(escape(atob(input)));
    outputText.value = decoded;

    analyzeContent(input, decoded, 'decode');
    generatePreview(decoded, input);
    addToHistory(input, decoded, '解码');
  } catch (err) {
    error.value = err instanceof Error ? err.message : '解码失败，请检查 Base64 格式是否正确';
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

  // 移除空白字符
  str = str.replace(/\s/g, '');

  // 检查长度
  if (str.length % 4 !== 0) return false;

  // 检查字符
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafeBase64Regex = /^[A-Za-z0-9_-]*={0,2}$/;

  return base64Regex.test(str) || urlSafeBase64Regex.test(str);
}

function validateBase64() {
  const input = inputText.value.trim();

  if (!input) {
    error.value = '请输入要验证的内容';
    return;
  }

  const isValid = isBase64(input);

  analysis.value = {
    type: 'Base64 验证',
    encoding: 'Base64',
    originalSize: formatBytes(input.length),
    encodedSize: '-',
    isValid,
    validationError: isValid ? undefined : '不是有效的 Base64 格式'
  };

  outputText.value = isValid ? '✅ Base64 格式有效' : '❌ Base64 格式无效';
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    // 10MB 限制
    error.value = '文件大小不能超过 10MB';
    return;
  }

  selectedFile.value = file;

  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1]; // 移除 data:mime;base64, 前缀

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
      addToHistory(file.name, encoded, '文件编码');
    };
    reader.readAsDataURL(file);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '文件读取失败';
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
    error.value = '请输入有效的 URL';
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
      addToHistory(inputUrl.value, encoded, 'URL编码');
    };

    reader.readAsDataURL(blob);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'URL 获取失败';
  }
}

function generateDataUrl() {
  if (!outputText.value) {
    error.value = '请先进行编码操作';
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
    type: operation === 'encode' ? '文本/文件' : '解码内容',
    encoding: 'Base64',
    originalSize: formatBytes(inputSize),
    encodedSize: formatBytes(outputSize),
    isValid: operation === 'decode' ? isBase64(input) : null
  };
}

function generatePreview(decoded: string, base64: string) {
  preview.value = null;

  try {
    // 尝试检测内容类型
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
      // 可打印的 ASCII 文本
      preview.value = {
        type: 'text',
        content: decoded
      };
    } else {
      // 尝试作为图片
      const dataUrl = `data:image/png;base64,${base64.replace(/\s/g, '')}`;
      preview.value = {
        type: 'image',
        dataUrl,
        filename: 'decoded-file',
        mimeType: 'image/png'
      };
    }
  } catch (err) {
    // 预览生成失败，不显示预览
  }
}

function loadSampleText() {
  inputText.value = 'Hello, World! 这是一个 Base64 编码示例。\n包含中文字符和特殊符号：@#$%^&*()';
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
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function downloadResult() {
  if (!outputText.value) return;

  let filename = 'base64-result.txt';
  let content = outputText.value;
  let mimeType = 'text/plain';

  if (analysis.value?.type === '解码内容' && preview.value?.type === 'image') {
    // 下载解码的图片
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
    console.error('保存处理历史失败:', error);
  }
}

function loadProcessHistory() {
  try {
    const saved = localStorage.getItem('base64-process-history');
    if (saved) {
      processHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载处理历史失败:', error);
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue';
const fileInput = ref<HTMLInputElement>();

onMounted(() => {
  loadProcessHistory();
});
</script>
