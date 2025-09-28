<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">URL 编码</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">原始文本</h4>
            <div class="flex gap-2">
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="inputText"
                rows="8"
                placeholder="在此输入需要编码的文本或 URL..."
                class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoEncode"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ inputText.length }}</span>
              <span>字节数: {{ getByteLength(inputText) }}</span>
              <span>行数: {{ inputText.split('\n').length }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">编码选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.autoEncode" type="checkbox" />
                <span class="text-sm">自动编码</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.encodeSpaces" type="checkbox" />
                <span class="text-sm">编码空格</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.encodeUnicode" type="checkbox" />
                <span class="text-sm">编码 Unicode</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.strictMode" type="checkbox" />
                <span class="text-sm">严格模式</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">编码类型</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center space-x-2">
                  <input v-model="options.encodeType" type="radio" value="component" />
                  <span class="text-sm">组件编码</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.encodeType" type="radio" value="uri" />
                  <span class="text-sm">URI 编码</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.encodeType" type="radio" value="form" />
                  <span class="text-sm">表单编码</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.encodeType" type="radio" value="custom" />
                  <span class="text-sm">自定义</span>
                </label>
              </div>
            </div>

            <div v-if="options.encodeType === 'custom'">
              <label class="block text-sm font-medium mb-2">自定义字符集</label>
              <input
                v-model="options.customChars"
                type="text"
                placeholder="输入需要编码的字符，如: !@#$%^&*()"
                class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">字符编码</label>
              <select v-model="options.charset" class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="utf-8">UTF-8</option>
                <option value="gbk">GBK</option>
                <option value="gb2312">GB2312</option>
                <option value="iso-8859-1">ISO-8859-1</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleUrl" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="encodeManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">手动编码</button>
            <button @click="parseUrl" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">解析 URL</button>
            <button @click="validateUrl" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">验证 URL</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.url,.csv" @change="handleFileUpload" class="hidden" />
              上传文件
            </label>
            <button @click="downloadEncoded" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载结果</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">编码结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">编码文本</h4>
            <div class="flex gap-2">
              <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="decodeResult" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">解码</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="encodedText" class="space-y-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto break-all">
                {{ encodedText }}
              </div>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>编码后字符数: {{ encodedText.length }}</span>
                <span>编码后字节数: {{ getByteLength(encodedText) }}</span>
                <span>增长率: {{ compressionRatio }}%</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入文本后将显示编码结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">编码分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>原始大小:</span>
                  <span class="font-mono">{{ formatBytes(getByteLength(inputText)) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>编码后大小:</span>
                  <span class="font-mono">{{ formatBytes(getByteLength(encodedText)) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>编码字符数:</span>
                  <span class="font-mono">{{ analysis.encodedChars }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>编码率:</span>
                  <span class="font-mono">{{ analysis.encodingRatio }}%</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>URL 类型:</span>
                  <span class="font-mono">{{ analysis.urlType }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>协议:</span>
                  <span class="font-mono">{{ analysis.protocol || 'N/A' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>域名:</span>
                  <span class="font-mono">{{ analysis.hostname || 'N/A' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>参数数量:</span>
                  <span class="font-mono">{{ analysis.paramCount }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">编码成功后将显示分析结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="urlParts">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">URL 解析</h4>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              <div v-if="urlParts.protocol" class="flex justify-between text-sm">
                <span class="font-medium">协议:</span>
                <span class="font-mono">{{ urlParts.protocol }}</span>
              </div>
              <div v-if="urlParts.hostname" class="flex justify-between text-sm">
                <span class="font-medium">主机名:</span>
                <span class="font-mono">{{ urlParts.hostname }}</span>
              </div>
              <div v-if="urlParts.port" class="flex justify-between text-sm">
                <span class="font-medium">端口:</span>
                <span class="font-mono">{{ urlParts.port }}</span>
              </div>
              <div v-if="urlParts.pathname" class="flex justify-between text-sm">
                <span class="font-medium">路径:</span>
                <span class="font-mono break-all">{{ urlParts.pathname }}</span>
              </div>
              <div v-if="urlParts.search" class="flex justify-between text-sm">
                <span class="font-medium">查询字符串:</span>
                <span class="font-mono break-all">{{ urlParts.search }}</span>
              </div>
              <div v-if="urlParts.hash" class="flex justify-between text-sm">
                <span class="font-medium">锚点:</span>
                <span class="font-mono break-all">{{ urlParts.hash }}</span>
              </div>

              <div v-if="urlParts.params && Object.keys(urlParts.params).length > 0" class="mt-4">
                <h5 class="font-medium mb-2">查询参数:</h5>
                <div class="space-y-1">
                  <div v-for="(value, key) in urlParts.params" :key="key" class="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span class="font-mono">{{ key }}:</span>
                    <span class="font-mono break-all">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">编码历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="encodeHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in encodeHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.type }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无编码历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">编码类型</h4>
          <ul class="space-y-1">
            <li>• <strong>组件编码:</strong> encodeURIComponent() - 编码所有特殊字符</li>
            <li>• <strong>URI 编码:</strong> encodeURI() - 保留 URI 结构字符</li>
            <li>• <strong>表单编码:</strong> application/x-www-form-urlencoded</li>
            <li>• <strong>自定义:</strong> 指定需要编码的字符集</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">编码规则</h4>
          <ul class="space-y-1">
            <li>• <strong>百分号编码:</strong> 使用 %XX 格式</li>
            <li>• <strong>空格处理:</strong> 可选择 %20 或 + 编码</li>
            <li>• <strong>Unicode 支持:</strong> UTF-8 编码</li>
            <li>• <strong>保留字符:</strong> A-Z a-z 0-9 - _ . ~</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">应用场景</h4>
          <ul class="space-y-1">
            <li>• <strong>URL 参数:</strong> 查询字符串编码</li>
            <li>• <strong>表单提交:</strong> POST 数据编码</li>
            <li>• <strong>API 调用:</strong> 请求参数编码</li>
            <li>• <strong>文件名:</strong> 特殊字符处理</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface EncodeOptions {
  autoEncode: boolean;
  encodeSpaces: boolean;
  encodeUnicode: boolean;
  strictMode: boolean;
  encodeType: 'component' | 'uri' | 'form' | 'custom';
  customChars: string;
  charset: string;
}

interface Analysis {
  encodedChars: number;
  encodingRatio: number;
  urlType: string;
  protocol?: string;
  hostname?: string;
  paramCount: number;
}

interface UrlParts {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  params?: Record<string, string>;
}

interface EncodeHistory {
  input: string;
  encoded: string;
  timestamp: string;
  preview: string;
  type: string;
}

const inputText = ref('');
const encodedText = ref('');

const options = ref<EncodeOptions>({
  autoEncode: true,
  encodeSpaces: true,
  encodeUnicode: true,
  strictMode: false,
  encodeType: 'component',
  customChars: '',
  charset: 'utf-8'
});

const encodeHistory = ref<EncodeHistory[]>([]);
const urlParts = ref<UrlParts | null>(null);

const compressionRatio = computed(() => {
  if (!inputText.value || !encodedText.value) return 0;
  const originalSize = getByteLength(inputText.value);
  const encodedSize = getByteLength(encodedText.value);
  return Math.round(((encodedSize - originalSize) / originalSize) * 100);
});

const analysis = computed((): Analysis | null => {
  if (!inputText.value || !encodedText.value) return null;

  const originalChars = inputText.value.length;
  const encodedChars = encodedText.value.match(/%[0-9A-Fa-f]{2}/g)?.length || 0;
  const encodingRatio = Math.round((encodedChars / originalChars) * 100);

  // 检测 URL 类型
  let urlType = 'Text';
  let protocol = '';
  let hostname = '';
  let paramCount = 0;

  try {
    if (inputText.value.includes('://') || inputText.value.startsWith('//')) {
      const url = new URL(inputText.value.startsWith('//') ? 'http:' + inputText.value : inputText.value);
      urlType = 'Complete URL';
      protocol = url.protocol;
      hostname = url.hostname;
      paramCount = Array.from(url.searchParams.keys()).length;
    } else if (inputText.value.includes('=') && inputText.value.includes('&')) {
      urlType = 'Query String';
      const params = new URLSearchParams(inputText.value);
      paramCount = Array.from(params.keys()).length;
    } else if (inputText.value.startsWith('/')) {
      urlType = 'Path';
    }
  } catch {
    // 不是有效的 URL
  }

  return {
    encodedChars,
    encodingRatio,
    urlType,
    protocol,
    hostname,
    paramCount
  };
});

watch(
  [() => options.value],
  () => {
    if (inputText.value && options.value.autoEncode) {
      performEncode();
    }
  },
  { deep: true }
);

function autoEncode() {
  if (!options.value.autoEncode || !inputText.value.trim()) {
    clearResults();
    return;
  }

  performEncode();
}

function performEncode() {
  if (!inputText.value.trim()) {
    clearResults();
    return;
  }

  try {
    let result = '';
    const text = inputText.value;

    switch (options.value.encodeType) {
      case 'component':
        result = encodeURIComponent(text);
        break;
      case 'uri':
        result = encodeURI(text);
        break;
      case 'form':
        result = encodeFormData(text);
        break;
      case 'custom':
        result = encodeCustom(text, options.value.customChars);
        break;
    }

    // 空格处理
    if (!options.value.encodeSpaces && options.value.encodeType === 'form') {
      result = result.replace(/%20/g, '+');
    }

    encodedText.value = result;

    // 解析 URL（如果是 URL）
    parseUrlParts(text);

    // 添加到历史记录
    addToHistory(text, result, options.value.encodeType);
  } catch (error) {
    console.error('编码失败:', error);
    encodedText.value = '';
  }
}

function encodeFormData(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (
        (code >= 48 && code <= 57) || // 0-9
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        char === '-' ||
        char === '_' ||
        char === '.' ||
        char === '~'
      ) {
        return char;
      }
      if (char === ' ') {
        return options.value.encodeSpaces ? '%20' : '+';
      }
      return encodeURIComponent(char);
    })
    .join('');
}

function encodeCustom(text: string, customChars: string): string {
  if (!customChars) return text;

  return text
    .split('')
    .map((char) => {
      if (customChars.includes(char)) {
        return encodeURIComponent(char);
      }
      return char;
    })
    .join('');
}

function parseUrlParts(text: string) {
  urlParts.value = null;

  try {
    let url: URL;

    if (text.includes('://')) {
      url = new URL(text);
    } else if (text.startsWith('//')) {
      url = new URL('http:' + text);
    } else if (text.startsWith('/')) {
      url = new URL('http://example.com' + text);
    } else {
      return;
    }

    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    urlParts.value = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: Object.keys(params).length > 0 ? params : undefined
    };
  } catch {
    // 不是有效的 URL，尝试解析查询字符串
    if (text.includes('=')) {
      try {
        const params: Record<string, string> = {};
        const searchParams = new URLSearchParams(text);
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        if (Object.keys(params).length > 0) {
          urlParts.value = { params };
        }
      } catch {
        // 解析失败
      }
    }
  }
}

function clearResults() {
  encodedText.value = '';
  urlParts.value = null;
}

function loadSampleUrl() {
  inputText.value = 'https://example.com/search?q=Hello World&lang=zh-CN&category=技术&date=2024-01-01';

  if (options.value.autoEncode) {
    performEncode();
  }
}

function encodeManually() {
  performEncode();
}

function parseUrl() {
  if (!inputText.value.trim()) {
    alert('请先输入 URL 或文本');
    return;
  }

  parseUrlParts(inputText.value);

  if (!urlParts.value) {
    alert('无法解析 URL 结构');
  }
}

function validateUrl() {
  if (!inputText.value.trim()) {
    alert('请先输入 URL');
    return;
  }

  try {
    new URL(inputText.value);
    alert('URL 格式有效');
  } catch {
    try {
      new URL('http://' + inputText.value);
      alert('URL 格式有效（缺少协议）');
    } catch {
      alert('URL 格式无效');
    }
  }
}

function clearAll() {
  inputText.value = '';
  clearResults();
}

async function copyResult() {
  if (!encodedText.value) return;

  try {
    await navigator.clipboard.writeText(encodedText.value);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function decodeResult() {
  if (!encodedText.value) return;

  try {
    const decoded = decodeURIComponent(encodedText.value);
    inputText.value = decoded;
  } catch (error) {
    console.error('解码失败:', error);
  }
}

function downloadEncoded() {
  if (!encodedText.value) return;

  const content = `原始文本:
${inputText.value}

编码结果:
${encodedText.value}

编码类型: ${options.value.encodeType}
生成时间: ${new Date().toLocaleString()}
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'url-encoded.txt';
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

    if (options.value.autoEncode) {
      performEncode();
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
    inputText.value = content;

    if (options.value.autoEncode) {
      performEncode();
    }
  };
  reader.readAsText(file);
}

function addToHistory(input: string, encoded: string, type: string) {
  const historyItem: EncodeHistory = {
    input,
    encoded,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
    type
  };

  encodeHistory.value.unshift(historyItem);
  encodeHistory.value = encodeHistory.value.slice(0, 10);
  saveEncodeHistory();
}

function loadFromHistory(history: EncodeHistory) {
  inputText.value = history.input;
  encodedText.value = history.encoded;
}

function clearHistory() {
  encodeHistory.value = [];
  saveEncodeHistory();
}

function saveEncodeHistory() {
  try {
    localStorage.setItem('url-encode-history', JSON.stringify(encodeHistory.value));
  } catch (error) {
    console.error('保存编码历史失败:', error);
  }
}

function loadEncodeHistory() {
  try {
    const saved = localStorage.getItem('url-encode-history');
    if (saved) {
      encodeHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载编码历史失败:', error);
  }
}

function getByteLength(str: string): number {
  return new Blob([str]).size;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue';

onMounted(() => {
  loadEncodeHistory();
});
</script>
