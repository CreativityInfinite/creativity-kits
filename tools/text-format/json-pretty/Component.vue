<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">JSON 美化工具</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">输入 JSON</h4>
            <div class="flex gap-2">
              <button @click="formatJson" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">美化</button>
              <button @click="minifyJson" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">压缩</button>
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="inputText"
                rows="12"
                placeholder="在此输入 JSON 内容..."
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoFormat"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ inputText.length }}</span>
              <span>行数: {{ inputText.split('\n').length }}</span>
              <span v-if="isValidJson !== null">
                {{ isValidJson ? '✅ 有效 JSON' : '❌ 无效 JSON' }}
              </span>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span>⚠️</span>
                <span class="font-medium">JSON 错误</span>
              </div>
              <div class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">格式化选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.sortKeys" type="checkbox" />
                <span class="text-sm">排序键名</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removeComments" type="checkbox" />
                <span class="text-sm">移除注释</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.escapeUnicode" type="checkbox" />
                <span class="text-sm">转义 Unicode</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.autoFormat" type="checkbox" />
                <span class="text-sm">自动格式化</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">缩进大小: {{ options.indent }}</label>
              <input v-model.number="options.indent" type="range" min="1" max="8" class="w-full" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>8</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">缩进类型</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="options.indentType" type="radio" value="space" />
                  <span class="text-sm">空格</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.indentType" type="radio" value="tab" />
                  <span class="text-sm">制表符</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleJson" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="validateJson" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">验证 JSON</button>
            <button @click="removeEmptyValues" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">移除空值</button>
            <button @click="flattenJson" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">扁平化</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".json,.txt" @change="handleFileUpload" class="hidden" />
              上传文件
            </label>
            <button @click="downloadResult" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载结果</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">格式化结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">输出结果</h4>
            <div class="flex gap-2">
              <button @click="copyOutput" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="toggleSyntaxHighlight" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
                {{ showSyntaxHighlight ? '关闭高亮' : '语法高亮' }}
              </button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="outputText" class="space-y-3">
              <div v-if="showSyntaxHighlight" class="relative">
                <pre class="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white overflow-auto max-h-96" v-html="highlightedJson"></pre>
              </div>
              <textarea
                v-else
                v-model="outputText"
                rows="12"
                readonly
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>

              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>字符数: {{ outputText.length }}</span>
                <span>行数: {{ outputText.split('\n').length }}</span>
                <span v-if="compressionRatio !== null"> {{ compressionRatio > 0 ? '压缩率' : '膨胀率' }}: {{ Math.abs(compressionRatio) }}% </span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入 JSON 后将显示格式化结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">JSON 分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">数据类型</div>
                  <div class="font-medium">{{ analysis.type }}</div>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">深度层级</div>
                  <div class="font-medium">{{ analysis.depth }}</div>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">键数量</div>
                  <div class="font-medium">{{ analysis.keyCount }}</div>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">数组长度</div>
                  <div class="font-medium">{{ analysis.arrayLength }}</div>
                </div>
              </div>

              <div v-if="analysis.keys && analysis.keys.length > 0">
                <div class="text-sm font-medium mb-2">顶级键名:</div>
                <div class="flex flex-wrap gap-1">
                  <span v-for="key in analysis.keys.slice(0, 10)" :key="key" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                    {{ key }}
                  </span>
                  <span v-if="analysis.keys.length > 10" class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs"> +{{ analysis.keys.length - 10 }} 更多 </span>
                </div>
              </div>

              <div v-if="analysis.statistics">
                <div class="text-sm font-medium mb-2">统计信息:</div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="flex justify-between">
                    <span>对象数:</span>
                    <span class="font-mono">{{ analysis.statistics.objects }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>数组数:</span>
                    <span class="font-mono">{{ analysis.statistics.arrays }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>字符串数:</span>
                    <span class="font-mono">{{ analysis.statistics.strings }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>数字数:</span>
                    <span class="font-mono">{{ analysis.statistics.numbers }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>布尔值数:</span>
                    <span class="font-mono">{{ analysis.statistics.booleans }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>空值数:</span>
                    <span class="font-mono">{{ analysis.statistics.nulls }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">输入有效 JSON 后将显示分析结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">格式化历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="formatHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in formatHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.operation }} - {{ history.timestamp }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无格式化历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">JSON 美化</h4>
          <ul class="space-y-1">
            <li>• <strong>格式化:</strong> 自动缩进和换行</li>
            <li>• <strong>排序键名:</strong> 按字母顺序排列</li>
            <li>• <strong>语法高亮:</strong> 彩色显示不同元素</li>
            <li>• <strong>错误检测:</strong> 实时验证 JSON 语法</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">JSON 压缩</h4>
          <ul class="space-y-1">
            <li>• <strong>移除空格:</strong> 压缩文件大小</li>
            <li>• <strong>移除换行:</strong> 单行显示</li>
            <li>• <strong>移除注释:</strong> 清理非标准内容</li>
            <li>• <strong>优化传输:</strong> 减少网络开销</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">高级功能</h4>
          <ul class="space-y-1">
            <li>• <strong>数据分析:</strong> 统计 JSON 结构信息</li>
            <li>• <strong>扁平化:</strong> 将嵌套对象展开</li>
            <li>• <strong>空值清理:</strong> 移除 null 和空字符串</li>
            <li>• <strong>文件处理:</strong> 支持大文件上传下载</li>
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
  depth: number;
  keyCount: number;
  arrayLength: number;
  keys?: string[];
  statistics?: {
    objects: number;
    arrays: number;
    strings: number;
    numbers: number;
    booleans: number;
    nulls: number;
  };
}

interface FormatHistory {
  input: string;
  output: string;
  operation: string;
  timestamp: string;
  preview: string;
}

const inputText = ref('');
const outputText = ref('');
const error = ref('');
const isValidJson = ref<boolean | null>(null);
const showSyntaxHighlight = ref(false);

const options = ref({
  indent: 2,
  indentType: 'space' as 'space' | 'tab',
  sortKeys: false,
  removeComments: false,
  escapeUnicode: false,
  autoFormat: true
});

const analysis = ref<Analysis | null>(null);
const formatHistory = ref<FormatHistory[]>([]);

const compressionRatio = computed(() => {
  if (!inputText.value || !outputText.value) return null;
  const originalSize = new Blob([inputText.value]).size;
  const formattedSize = new Blob([outputText.value]).size;
  if (originalSize === 0) return null;
  return Math.round(((formattedSize - originalSize) / originalSize) * 100);
});

const highlightedJson = computed(() => {
  if (!outputText.value) return '';
  return highlightJson(outputText.value);
});

watch(
  [() => options.value],
  () => {
    if (inputText.value && outputText.value && options.value.autoFormat) {
      formatJson();
    }
  },
  { deep: true }
);

function autoFormat() {
  if (!options.value.autoFormat || !inputText.value.trim()) {
    outputText.value = '';
    analysis.value = null;
    isValidJson.value = null;
    return;
  }

  formatJson();
}

function formatJson() {
  error.value = '';

  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = '请输入 JSON 内容';
      return;
    }

    // 移除注释（如果启用）
    let processedInput = input;
    if (options.value.removeComments) {
      processedInput = removeJsonComments(input);
    }

    const parsed = JSON.parse(processedInput);

    let result = parsed;
    if (options.value.sortKeys) {
      result = sortObjectKeys(parsed);
    }

    const indentChar = options.value.indentType === 'tab' ? '\t' : ' '.repeat(options.value.indent);
    let jsonString = JSON.stringify(result, null, indentChar);

    if (options.value.escapeUnicode) {
      jsonString = escapeUnicode(jsonString);
    }

    outputText.value = jsonString;
    isValidJson.value = true;
    analyzeJson(parsed);
    addToHistory(input, jsonString, 'JSON 美化');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败';
    isValidJson.value = false;
    analysis.value = null;
  }
}

function minifyJson() {
  error.value = '';

  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = '请输入 JSON 内容';
      return;
    }

    // 移除注释（如果启用）
    let processedInput = input;
    if (options.value.removeComments) {
      processedInput = removeJsonComments(input);
    }

    const parsed = JSON.parse(processedInput);

    let result = parsed;
    if (options.value.sortKeys) {
      result = sortObjectKeys(parsed);
    }

    let jsonString = JSON.stringify(result);

    if (options.value.escapeUnicode) {
      jsonString = escapeUnicode(jsonString);
    }

    outputText.value = jsonString;
    isValidJson.value = true;
    analyzeJson(parsed);
    addToHistory(input, jsonString, 'JSON 压缩');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败';
    isValidJson.value = false;
    analysis.value = null;
  }
}

function removeJsonComments(jsonString: string): string {
  // 简单的注释移除（不处理字符串内的注释）
  return jsonString
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除 /* */ 注释
    .replace(/\/\/.*$/gm, ''); // 移除 // 注释
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

function escapeUnicode(str: string): string {
  return str.replace(/[\u0080-\uFFFF]/g, (match) => {
    return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).substr(-4);
  });
}

function highlightJson(jsonString: string): string {
  // 简单的 JSON 语法高亮
  return jsonString
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-gray-900 dark:text-gray-100';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-600 dark:text-blue-400'; // 键名
        } else {
          cls = 'text-green-600 dark:text-green-400'; // 字符串值
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-purple-600 dark:text-purple-400'; // 布尔值
      } else if (/null/.test(match)) {
        cls = 'text-red-600 dark:text-red-400'; // null
      } else {
        cls = 'text-orange-600 dark:text-orange-400'; // 数字
      }
      return `<span class="${cls}">${match}</span>`;
    })
    .replace(/([{}])/g, '<span class="text-gray-600 dark:text-gray-400">$1</span>') // 大括号
    .replace(/([[\\]])/g, '<span class="text-gray-600 dark:text-gray-400">$1</span>'); // 方括号
}

function analyzeJson(data: any) {
  const analysis: Analysis = {
    type: Array.isArray(data) ? 'Array' : typeof data === 'object' && data !== null ? 'Object' : typeof data,
    depth: getDepth(data),
    keyCount: 0,
    arrayLength: 0
  };

  if (Array.isArray(data)) {
    analysis.arrayLength = data.length;
  } else if (typeof data === 'object' && data !== null) {
    analysis.keys = Object.keys(data);
    analysis.keyCount = analysis.keys.length;
  }

  // 统计各种类型的数量
  const statistics = {
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0
  };

  countTypes(data, statistics);
  analysis.statistics = statistics;

  this.analysis = analysis;
}

function getDepth(obj: any, currentDepth: number = 0): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth;
  }

  let maxDepth = currentDepth;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      maxDepth = Math.max(maxDepth, getDepth(item, currentDepth + 1));
    }
  } else {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        maxDepth = Math.max(maxDepth, getDepth(obj[key], currentDepth + 1));
      }
    }
  }

  return maxDepth;
}

function countTypes(obj: any, stats: any) {
  if (obj === null) {
    stats.nulls++;
  } else if (Array.isArray(obj)) {
    stats.arrays++;
    obj.forEach((item) => countTypes(item, stats));
  } else if (typeof obj === 'object') {
    stats.objects++;
    Object.values(obj).forEach((value) => countTypes(value, stats));
  } else if (typeof obj === 'string') {
    stats.strings++;
  } else if (typeof obj === 'number') {
    stats.numbers++;
  } else if (typeof obj === 'boolean') {
    stats.booleans++;
  }
}

function validateJson() {
  try {
    const input = inputText.value.trim();
    if (!input) {
      outputText.value = '❌ 请输入 JSON 内容';
      return;
    }

    JSON.parse(input);
    outputText.value = '✅ JSON 格式有效';
    isValidJson.value = true;
  } catch (err) {
    outputText.value = `❌ JSON 格式无效: ${err instanceof Error ? err.message : '未知错误'}`;
    isValidJson.value = false;
  }
}

function removeEmptyValues() {
  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = '请输入 JSON 内容';
      return;
    }

    const parsed = JSON.parse(input);
    const cleaned = removeEmpty(parsed);

    const indentChar = options.value.indentType === 'tab' ? '\t' : ' '.repeat(options.value.indent);
    const jsonString = JSON.stringify(cleaned, null, indentChar);

    outputText.value = jsonString;
    analyzeJson(cleaned);
    addToHistory(input, jsonString, '移除空值');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败';
  }
}

function removeEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeEmpty).filter((item) => item !== null && item !== undefined && item !== '');
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach((key) => {
      const value = removeEmpty(obj[key]);
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }
  return obj;
}

function flattenJson() {
  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = '请输入 JSON 内容';
      return;
    }

    const parsed = JSON.parse(input);
    const flattened = flatten(parsed);

    const indentChar = options.value.indentType === 'tab' ? '\t' : ' '.repeat(options.value.indent);
    const jsonString = JSON.stringify(flattened, null, indentChar);

    outputText.value = jsonString;
    analyzeJson(flattened);
    addToHistory(input, jsonString, 'JSON 扁平化');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败';
  }
}

function flatten(obj: any, prefix: string = ''): any {
  const flattened: any = {};

  Object.keys(obj).forEach((key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flatten(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

function loadSampleJson() {
  inputText.value = `{
  "name": "张三",
  "age": 28,
  "city": "北京",
  "skills": ["JavaScript", "Vue.js", "Node.js"],
  "address": {
    "street": "朝阳区建国路",
    "zipCode": "100020",
    "coordinates": {
      "lat": 39.9042,
      "lng": 116.4074
    }
  },
  "isActive": true,
  "salary": null,
  "projects": [
    {
      "name": "项目A",
      "status": "completed",
      "duration": 6
    },
    {
      "name": "项目B",
      "status": "in-progress",
      "duration": 3
    }
  ]
}`;

  if (options.value.autoFormat) {
    formatJson();
  }
}

function toggleSyntaxHighlight() {
  showSyntaxHighlight.value = !showSyntaxHighlight.value;
}

function clearAll() {
  inputText.value = '';
  outputText.value = '';
  error.value = '';
  analysis.value = null;
  isValidJson.value = null;
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

  const filename = 'formatted.json';
  const mimeType = 'application/json';

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

    if (options.value.autoFormat) {
      formatJson();
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

    if (options.value.autoFormat) {
      formatJson();
    }
  };
  reader.readAsText(file);
}

function addToHistory(input: string, output: string, operation: string) {
  const historyItem: FormatHistory = {
    input,
    output,
    operation,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 50) + (input.length > 50 ? '...' : '')
  };

  formatHistory.value.unshift(historyItem);
  formatHistory.value = formatHistory.value.slice(0, 10);
  saveFormatHistory();
}

function loadFromHistory(history: FormatHistory) {
  inputText.value = history.input;
  outputText.value = history.output;
}

function clearHistory() {
  formatHistory.value = [];
  saveFormatHistory();
}

function saveFormatHistory() {
  try {
    localStorage.setItem('json-format-history', JSON.stringify(formatHistory.value));
  } catch (error) {
    console.error('保存格式化历史失败:', error);
  }
}

function loadFormatHistory() {
  try {
    const saved = localStorage.getItem('json-format-history');
    if (saved) {
      formatHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载格式化历史失败:', error);
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue';

onMounted(() => {
  loadFormatHistory();
});
</script>
