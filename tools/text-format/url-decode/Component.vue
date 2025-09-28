<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">URL 解码</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">编码文本</h4>
            <div class="flex gap-2">
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="encodedText"
                rows="8"
                placeholder="在此输入需要解码的 URL 编码文本..."
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoDecode"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ encodedText.length }}</span>
              <span>编码字符: {{ encodedCharCount }}</span>
              <span>行数: {{ encodedText.split('\n').length }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">解码选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.autoDecode" type="checkbox" />
                <span class="text-sm">自动解码</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.decodePlus" type="checkbox" />
                <span class="text-sm">解码 + 为空格</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.strictMode" type="checkbox" />
                <span class="text-sm">严格模式</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.multipleDecoding" type="checkbox" />
                <span class="text-sm">多重解码</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">解码类型</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center space-x-2">
                  <input v-model="options.decodeType" type="radio" value="component" />
                  <span class="text-sm">组件解码</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.decodeType" type="radio" value="uri" />
                  <span class="text-sm">URI 解码</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.decodeType" type="radio" value="form" />
                  <span class="text-sm">表单解码</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.decodeType" type="radio" value="auto" />
                  <span class="text-sm">自动检测</span>
                </label>
              </div>
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
            <button @click="loadSampleData" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="decodeManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">手动解码</button>
            <button @click="validateEncoding" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">验证编码</button>
            <button @click="analyzeUrl" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">分析 URL</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.url,.csv" @change="handleFileUpload" class="hidden" />
              上传文件
            </label>
            <button @click="downloadDecoded" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载结果</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">解码结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">解码文本</h4>
            <div class="flex gap-2">
              <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="encodeResult" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">重新编码</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="decodedText !== null" class="space-y-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm min-h-[200px] max-h-[400px] overflow-auto break-all">
                <pre>{{ decodedText }}</pre>
              </div>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>解码后字符数: {{ decodedText.length }}</span>
                <span>解码后字节数: {{ getByteLength(decodedText) }}</span>
                <span>压缩率: {{ compressionRatio }}%</span>
              </div>
            </div>
            <div v-else-if="error" class="text-center py-8">
              <div class="text-red-600 mb-2">解码失败</div>
              <div class="text-sm text-gray-500">{{ error }}</div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入编码文本后将显示解码结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">解码分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>原始大小:</span>
                  <span class="font-mono">{{ formatBytes(getByteLength(encodedText)) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>解码后大小:</span>
                  <span class="font-mono">{{ formatBytes(getByteLength(decodedText || '')) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>编码字符数:</span>
                  <span class="font-mono">{{ analysis.encodedChars }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>解码次数:</span>
                  <span class="font-mono">{{ analysis.decodeSteps }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>检测类型:</span>
                  <span class="font-mono">{{ analysis.detectedType }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>编码格式:</span>
                  <span class="font-mono">{{ analysis.encodingFormat }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>是否 URL:</span>
                  <span class="font-mono">{{ analysis.isUrl ? '是' : '否' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>参数数量:</span>
                  <span class="font-mono">{{ analysis.paramCount }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">解码成功后将显示分析结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="urlAnalysis">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">URL 分析</h4>
          </div>
          <div class="p-4">
            <div class="space-y-3">
              <div v-if="urlAnalysis.protocol" class="flex justify-between text-sm">
                <span class="font-medium">协议:</span>
                <span class="font-mono">{{ urlAnalysis.protocol }}</span>
              </div>
              <div v-if="urlAnalysis.hostname" class="flex justify-between text-sm">
                <span class="font-medium">主机名:</span>
                <span class="font-mono">{{ urlAnalysis.hostname }}</span>
              </div>
              <div v-if="urlAnalysis.port" class="flex justify-between text-sm">
                <span class="font-medium">端口:</span>
                <span class="font-mono">{{ urlAnalysis.port }}</span>
              </div>
              <div v-if="urlAnalysis.pathname" class="flex justify-between text-sm">
                <span class="font-medium">路径:</span>
                <span class="font-mono break-all">{{ urlAnalysis.pathname }}</span>
              </div>
              <div v-if="urlAnalysis.search" class="flex justify-between text-sm">
                <span class="font-medium">查询字符串:</span>
                <span class="font-mono break-all">{{ urlAnalysis.search }}</span>
              </div>
              <div v-if="urlAnalysis.hash" class="flex justify-between text-sm">
                <span class="font-medium">锚点:</span>
                <span class="font-mono break-all">{{ urlAnalysis.hash }}</span>
              </div>

              <div v-if="urlAnalysis.params && Object.keys(urlAnalysis.params).length > 0" class="mt-4">
                <h5 class="font-medium mb-2">查询参数:</h5>
                <div class="space-y-1">
                  <div v-for="(value, key) in urlAnalysis.params" :key="key" class="flex justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span class="font-mono">{{ key }}:</span>
                    <span class="font-mono break-all">{{ value }}</span>
                  </div>
                </div>
              </div>

              <div v-if="urlAnalysis.decodedParams && Object.keys(urlAnalysis.decodedParams).length > 0" class="mt-4">
                <h5 class="font-medium mb-2">解码后参数:</h5>
                <div class="space-y-1">
                  <div v-for="(value, key) in urlAnalysis.decodedParams" :key="key" class="flex justify-between text-sm bg-green-50 dark:bg-green-900 p-2 rounded">
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
            <h4 class="font-medium">解码历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="decodeHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in decodeHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.type }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无解码历史</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="decodingSteps.length > 1">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">解码步骤</h4>
          </div>
          <div class="p-4">
            <div class="space-y-2">
              <div v-for="(step, index) in decodingSteps" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm font-medium">步骤 {{ index + 1 }}</span>
                  <span class="text-xs text-gray-500">{{ step.method }}</span>
                </div>
                <div class="font-mono text-xs break-all">{{ step.result.slice(0, 100) }}{{ step.result.length > 100 ? '...' : '' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">解码类型</h4>
          <ul class="space-y-1">
            <li>• <strong>组件解码:</strong> decodeURIComponent() - 解码所有编码字符</li>
            <li>• <strong>URI 解码:</strong> decodeURI() - 保留 URI 结构字符</li>
            <li>• <strong>表单解码:</strong> 处理 + 号和 %XX 编码</li>
            <li>• <strong>自动检测:</strong> 智能识别编码类型</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">解码规则</h4>
          <ul class="space-y-1">
            <li>• <strong>百分号解码:</strong> %XX 格式转换为字符</li>
            <li>• <strong>加号处理:</strong> + 转换为空格（表单模式）</li>
            <li>• <strong>多重解码:</strong> 自动检测并处理多次编码</li>
            <li>• <strong>错误处理:</strong> 无效编码的容错处理</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">应用场景</h4>
          <ul class="space-y-1">
            <li>• <strong>URL 参数:</strong> 查询字符串解码</li>
            <li>• <strong>表单数据:</strong> POST 数据解码</li>
            <li>• <strong>日志分析:</strong> 访问日志中的 URL 解码</li>
            <li>• <strong>调试工具:</strong> 网络请求参数解析</li>
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
  decodePlus: boolean;
  strictMode: boolean;
  multipleDecoding: boolean;
  decodeType: 'component' | 'uri' | 'form' | 'auto';
  charset: string;
}

interface Analysis {
  encodedChars: number;
  decodeSteps: number;
  detectedType: string;
  encodingFormat: string;
  isUrl: boolean;
  paramCount: number;
}

interface UrlAnalysis {
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  params?: Record<string, string>;
  decodedParams?: Record<string, string>;
}

interface DecodeHistory {
  encoded: string;
  decoded: string;
  timestamp: string;
  preview: string;
  type: string;
}

interface DecodingStep {
  method: string;
  result: string;
}

const encodedText = ref('');
const decodedText = ref<string | null>(null);
const error = ref('');

const options = ref<DecodeOptions>({
  autoDecode: true,
  decodePlus: true,
  strictMode: false,
  multipleDecoding: true,
  decodeType: 'auto',
  charset: 'utf-8'
});

const decodeHistory = ref<DecodeHistory[]>([]);
const urlAnalysis = ref<UrlAnalysis | null>(null);
const decodingSteps = ref<DecodingStep[]>([]);

const encodedCharCount = computed(() => {
  return (encodedText.value.match(/%[0-9A-Fa-f]{2}/g) || []).length;
});

const compressionRatio = computed(() => {
  if (!encodedText.value || !decodedText.value) return 0;
  const originalSize = getByteLength(encodedText.value);
  const decodedSize = getByteLength(decodedText.value);
  return Math.round(((originalSize - decodedSize) / originalSize) * 100);
});

const analysis = computed((): Analysis | null => {
  if (!encodedText.value || decodedText.value === null) return null;

  const encodedChars = encodedCharCount.value;
  const decodeSteps = decodingSteps.value.length;

  // 检测编码类型
  let detectedType = 'Unknown';
  let encodingFormat = 'Standard';

  if (encodedText.value.includes('+') && encodedText.value.includes('%')) {
    detectedType = 'Form Data';
    encodingFormat = 'application/x-www-form-urlencoded';
  } else if (encodedText.value.includes('%')) {
    detectedType = 'URL Encoded';
    encodingFormat = 'Percent Encoding';
  } else if (encodedText.value.includes('+')) {
    detectedType = 'Form Data (Plus)';
    encodingFormat = 'Plus Encoding';
  } else {
    detectedType = 'Plain Text';
    encodingFormat = 'None';
  }

  // 检测是否为 URL
  let isUrl = false;
  let paramCount = 0;

  try {
    if (decodedText.value && (decodedText.value.includes('://') || decodedText.value.startsWith('//'))) {
      const url = new URL(decodedText.value.startsWith('//') ? 'http:' + decodedText.value : decodedText.value);
      isUrl = true;
      paramCount = Array.from(url.searchParams.keys()).length;
    } else if (decodedText.value && decodedText.value.includes('=') && decodedText.value.includes('&')) {
      const params = new URLSearchParams(decodedText.value);
      paramCount = Array.from(params.keys()).length;
    }
  } catch {
    // 不是有效的 URL
  }

  return {
    encodedChars,
    decodeSteps,
    detectedType,
    encodingFormat,
    isUrl,
    paramCount
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
    decodingSteps.value = [];

    let result = encodedText.value;
    let currentStep = 1;
    const maxSteps = options.value.multipleDecoding ? 10 : 1;

    // 记录原始输入
    decodingSteps.value.push({
      method: 'Original',
      result: result
    });

    while (currentStep <= maxSteps) {
      const previousResult = result;

      // 根据解码类型选择方法
      switch (options.value.decodeType) {
        case 'component':
          result = decodeURIComponent(result);
          break;
        case 'uri':
          result = decodeURI(result);
          break;
        case 'form':
          result = decodeFormData(result);
          break;
        case 'auto':
          result = autoDetectDecode(result);
          break;
      }

      // 记录解码步骤
      if (result !== previousResult) {
        decodingSteps.value.push({
          method: `${options.value.decodeType} (Step ${currentStep})`,
          result: result
        });
      }

      // 如果结果没有变化或不需要多重解码，停止
      if (result === previousResult || !options.value.multipleDecoding) {
        break;
      }

      // 检查是否还有编码字符
      if (!result.includes('%') && (!options.value.decodePlus || !result.includes('+'))) {
        break;
      }

      currentStep++;
    }

    decodedText.value = result;

    // 分析 URL（如果是 URL）
    analyzeDecodedUrl(result);

    // 添加到历史记录
    addToHistory(encodedText.value, result, options.value.decodeType);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '解码失败';
    decodedText.value = null;
    urlAnalysis.value = null;
    decodingSteps.value = [];
  }
}

function decodeFormData(text: string): string {
  let result = text;

  // 处理 + 号
  if (options.value.decodePlus) {
    result = result.replace(/\+/g, ' ');
  }

  // 处理百分号编码
  try {
    result = decodeURIComponent(result);
  } catch {
    // 如果解码失败，尝试手动解码
    result = result.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return match;
      }
    });
  }

  return result;
}

function autoDetectDecode(text: string): string {
  // 检测编码类型并选择合适的解码方法
  if (text.includes('+') && text.includes('%')) {
    return decodeFormData(text);
  } else if (text.includes('%')) {
    try {
      return decodeURIComponent(text);
    } catch {
      return decodeURI(text);
    }
  } else if (text.includes('+') && options.value.decodePlus) {
    return text.replace(/\+/g, ' ');
  }

  return text;
}

function analyzeDecodedUrl(text: string) {
  urlAnalysis.value = null;

  try {
    let url: URL;

    if (text.includes('://')) {
      url = new URL(text);
    } else if (text.startsWith('//')) {
      url = new URL('http:' + text);
    } else if (text.startsWith('/')) {
      url = new URL('http://example.com' + text);
    } else {
      // 尝试解析查询字符串
      if (text.includes('=')) {
        const params: Record<string, string> = {};
        const decodedParams: Record<string, string> = {};

        const searchParams = new URLSearchParams(text);
        searchParams.forEach((value, key) => {
          params[key] = value;
          try {
            decodedParams[decodeURIComponent(key)] = decodeURIComponent(value);
          } catch {
            decodedParams[key] = value;
          }
        });

        if (Object.keys(params).length > 0) {
          urlAnalysis.value = {
            params,
            decodedParams: Object.keys(decodedParams).some((k) => k !== params[k] || decodedParams[k] !== params[k]) ? decodedParams : undefined
          };
        }
      }
      return;
    }

    const params: Record<string, string> = {};
    const decodedParams: Record<string, string> = {};

    url.searchParams.forEach((value, key) => {
      params[key] = value;
      try {
        decodedParams[decodeURIComponent(key)] = decodeURIComponent(value);
      } catch {
        decodedParams[key] = value;
      }
    });

    urlAnalysis.value = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: Object.keys(params).length > 0 ? params : undefined,
      decodedParams: Object.keys(decodedParams).some((k) => k !== params[k] || decodedParams[k] !== params[k]) ? decodedParams : undefined
    };
  } catch {
    // 解析失败
  }
}

function clearResults() {
  decodedText.value = null;
  error.value = '';
  urlAnalysis.value = null;
  decodingSteps.value = [];
}

function loadSampleData() {
  encodedText.value = 'https%3A//example.com/search%3Fq%3DHello%2BWorld%26lang%3Dzh-CN%26category%3D%E6%8A%80%E6%9C%AF%26date%3D2024-01-01';

  if (options.value.autoDecode) {
    performDecode();
  }
}

function decodeManually() {
  performDecode();
}

function validateEncoding() {
  if (!encodedText.value.trim()) {
    alert('请先输入编码文本');
    return;
  }

  const encodedChars = encodedCharCount.value;
  const hasPlus = encodedText.value.includes('+');
  const hasPercent = encodedText.value.includes('%');

  let message = '编码验证结果:\n';
  message += `编码字符数: ${encodedChars}\n`;
  message += `包含 + 号: ${hasPlus ? '是' : '否'}\n`;
  message += `包含 % 编码: ${hasPercent ? '是' : '否'}\n`;

  if (encodedChars > 0 || hasPlus) {
    message += '检测到有效的 URL 编码';
  } else {
    message += '未检测到 URL 编码';
  }

  alert(message);
}

function analyzeUrl() {
  if (!decodedText.value) {
    alert('请先解码文本');
    return;
  }

  analyzeDecodedUrl(decodedText.value);

  if (!urlAnalysis.value) {
    alert('无法分析 URL 结构');
  }
}

function clearAll() {
  encodedText.value = '';
  clearResults();
}

async function copyResult() {
  if (!decodedText.value) return;

  try {
    await navigator.clipboard.writeText(decodedText.value);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function encodeResult() {
  if (!decodedText.value) return;

  try {
    const encoded = encodeURIComponent(decodedText.value);
    encodedText.value = encoded;
  } catch (error) {
    console.error('编码失败:', error);
  }
}

function downloadDecoded() {
  if (!decodedText.value) return;

  const content = `编码文本:
${encodedText.value}

解码结果:
${decodedText.value}

解码类型: ${options.value.decodeType}
解码步骤: ${decodingSteps.value.length}
生成时间: ${new Date().toLocaleString()}
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'url-decoded.txt';
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

function addToHistory(encoded: string, decoded: string, type: string) {
  const historyItem: DecodeHistory = {
    encoded,
    decoded,
    timestamp: new Date().toLocaleString(),
    preview: decoded.slice(0, 50) + (decoded.length > 50 ? '...' : ''),
    type
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
    localStorage.setItem('url-decode-history', JSON.stringify(decodeHistory.value));
  } catch (error) {
    console.error('保存解码历史失败:', error);
  }
}

function loadDecodeHistory() {
  try {
    const saved = localStorage.getItem('url-decode-history');
    if (saved) {
      decodeHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载解码历史失败:', error);
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
  loadDecodeHistory();
});
</script>
