<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">JSON 压缩工具</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">输入 JSON</h4>
            <div class="flex gap-2">
              <button @click="minifyJson" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">压缩</button>
              <button @click="beautifyJson" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">美化</button>
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
                @input="autoMinify"
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
          <h4 class="font-medium mb-3">压缩选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.removeWhitespace" type="checkbox" />
                <span class="text-sm">移除空格</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removeNewlines" type="checkbox" />
                <span class="text-sm">移除换行</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removeComments" type="checkbox" />
                <span class="text-sm">移除注释</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.sortKeys" type="checkbox" />
                <span class="text-sm">排序键名</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.removeEmptyValues" type="checkbox" />
                <span class="text-sm">移除空值</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.autoMinify" type="checkbox" />
                <span class="text-sm">自动压缩</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">压缩级别</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="options.compressionLevel" type="radio" value="minimal" />
                  <span class="text-sm">最小压缩</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.compressionLevel" type="radio" value="standard" />
                  <span class="text-sm">标准压缩</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.compressionLevel" type="radio" value="aggressive" />
                  <span class="text-sm">激进压缩</span>
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
            <button @click="optimizeForSize" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">优化大小</button>
            <button @click="optimizeForSpeed" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">优化速度</button>
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
        <h3 class="font-medium text-lg">压缩结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">输出结果</h4>
            <div class="flex gap-2">
              <button @click="copyOutput" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="compareWithOriginal" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">对比原文</button>
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
                <span>字符数: {{ outputText.length }}</span>
                <span>行数: {{ outputText.split('\n').length }}</span>
                <span v-if="compressionRatio !== null" class="font-medium" :class="compressionRatio > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ compressionRatio > 0 ? '压缩' : '膨胀' }}: {{ Math.abs(compressionRatio) }}%
                </span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入 JSON 后将显示压缩结果</div>
          </div>
        </div>

        <div v-if="showComparison" class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">对比分析</h4>
            <button @click="showComparison = false" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">关闭</button>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium mb-2">原始 JSON</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>文件大小:</span>
                    <span class="font-mono">{{ formatBytes(originalSize) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>字符数:</span>
                    <span class="font-mono">{{ inputText.length }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>行数:</span>
                    <span class="font-mono">{{ inputText.split('\n').length }}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 class="font-medium mb-2">压缩后 JSON</h5>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>文件大小:</span>
                    <span class="font-mono">{{ formatBytes(compressedSize) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>字符数:</span>
                    <span class="font-mono">{{ outputText.length }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>行数:</span>
                    <span class="font-mono">{{ outputText.split('\n').length }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div class="text-sm font-medium mb-2">压缩效果:</div>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex justify-between">
                  <span>节省空间:</span>
                  <span class="font-mono text-green-600">{{ formatBytes(originalSize - compressedSize) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>压缩比率:</span>
                  <span class="font-mono text-blue-600">{{ Math.abs(compressionRatio || 0) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">压缩分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="space-y-3">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">数据类型</div>
                  <div class="font-medium">{{ analysis.type }}</div>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">压缩级别</div>
                  <div class="font-medium">{{ getCompressionLevelText(options.compressionLevel) }}</div>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">移除项目</div>
                  <div class="font-medium">{{ analysis.removedItems }}</div>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">优化建议</div>
                  <div class="font-medium">{{ analysis.suggestion }}</div>
                </div>
              </div>

              <div v-if="analysis.statistics">
                <div class="text-sm font-medium mb-2">压缩统计:</div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="flex justify-between">
                    <span>移除空格:</span>
                    <span class="font-mono">{{ analysis.statistics.whitespaceRemoved }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>移除换行:</span>
                    <span class="font-mono">{{ analysis.statistics.newlinesRemoved }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>移除注释:</span>
                    <span class="font-mono">{{ analysis.statistics.commentsRemoved }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>移除空值:</span>
                    <span class="font-mono">{{ analysis.statistics.emptyValuesRemoved }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">输入有效 JSON 后将显示压缩分析</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">压缩历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="compressionHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in compressionHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.operation }} - 压缩{{ Math.abs(history.ratio) }}% - {{ history.timestamp }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无压缩历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">压缩级别</h4>
          <ul class="space-y-1">
            <li>• <strong>最小压缩:</strong> 仅移除不必要的空格</li>
            <li>• <strong>标准压缩:</strong> 移除空格和换行符</li>
            <li>• <strong>激进压缩:</strong> 移除所有可选内容</li>
            <li>• <strong>自定义:</strong> 根据选项自由组合</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">优化选项</h4>
          <ul class="space-y-1">
            <li>• <strong>移除空值:</strong> 删除 null 和空字符串</li>
            <li>• <strong>排序键名:</strong> 按字母顺序排列</li>
            <li>• <strong>移除注释:</strong> 清理非标准内容</li>
            <li>• <strong>优化传输:</strong> 减少网络开销</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">应用场景</h4>
          <ul class="space-y-1">
            <li>• <strong>API 传输:</strong> 减少网络传输时间</li>
            <li>• <strong>存储优化:</strong> 节省磁盘空间</li>
            <li>• <strong>配置文件:</strong> 压缩配置数据</li>
            <li>• <strong>数据交换:</strong> 提高处理效率</li>
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
  removedItems: number;
  suggestion: string;
  statistics?: {
    whitespaceRemoved: number;
    newlinesRemoved: number;
    commentsRemoved: number;
    emptyValuesRemoved: number;
  };
}

interface CompressionHistory {
  input: string;
  output: string;
  operation: string;
  ratio: number;
  timestamp: string;
  preview: string;
}

const inputText = ref('');
const outputText = ref('');
const error = ref('');
const isValidJson = ref<boolean | null>(null);
const showComparison = ref(false);

const options = ref({
  removeWhitespace: true,
  removeNewlines: true,
  removeComments: true,
  sortKeys: false,
  removeEmptyValues: false,
  autoMinify: true,
  compressionLevel: 'standard' as 'minimal' | 'standard' | 'aggressive'
});

const analysis = ref<Analysis | null>(null);
const compressionHistory = ref<CompressionHistory[]>([]);

const compressionRatio = computed(() => {
  if (!inputText.value || !outputText.value) return null;
  const originalSize = new Blob([inputText.value]).size;
  const compressedSize = new Blob([outputText.value]).size;
  if (originalSize === 0) return null;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
});

const originalSize = computed(() => {
  return inputText.value ? new Blob([inputText.value]).size : 0;
});

const compressedSize = computed(() => {
  return outputText.value ? new Blob([outputText.value]).size : 0;
});

watch(
  [() => options.value],
  () => {
    if (inputText.value && outputText.value && options.value.autoMinify) {
      minifyJson();
    }
  },
  { deep: true }
);

function autoMinify() {
  if (!options.value.autoMinify || !inputText.value.trim()) {
    outputText.value = '';
    analysis.value = null;
    isValidJson.value = null;
    return;
  }

  minifyJson();
}

function minifyJson() {
  error.value = '';

  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = '请输入 JSON 内容';
      return;
    }

    // 应用压缩级别预设
    applyCompressionLevel();

    // 移除注释（如果启用）
    let processedInput = input;
    if (options.value.removeComments) {
      processedInput = removeJsonComments(input);
    }

    const parsed = JSON.parse(processedInput);

    let result = parsed;

    // 移除空值
    if (options.value.removeEmptyValues) {
      result = removeEmptyValues(result);
    }

    // 排序键名
    if (options.value.sortKeys) {
      result = sortObjectKeys(result);
    }

    // 生成压缩的 JSON
    let jsonString = JSON.stringify(result);

    // 根据选项进一步处理
    if (!options.value.removeWhitespace) {
      jsonString = JSON.stringify(result, null, 2);
    }

    outputText.value = jsonString;
    isValidJson.value = true;
    analyzeCompression(input, jsonString);
    addToHistory(input, jsonString, '压缩', compressionRatio.value || 0);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败';
    isValidJson.value = false;
    analysis.value = null;
  }
}

function beautifyJson() {
  error.value = '';

  try {
    const input = inputText.value.trim();
    if (!input) {
      error.value = '请输入 JSON 内容';
      return;
    }

    const parsed = JSON.parse(input);

    let result = parsed;
    if (options.value.sortKeys) {
      result = sortObjectKeys(parsed);
    }

    const jsonString = JSON.stringify(result, null, 2);

    outputText.value = jsonString;
    isValidJson.value = true;
    analyzeCompression(input, jsonString);
    addToHistory(input, jsonString, '美化', compressionRatio.value || 0);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败';
    isValidJson.value = false;
    analysis.value = null;
  }
}

function applyCompressionLevel() {
  switch (options.value.compressionLevel) {
    case 'minimal':
      options.value.removeWhitespace = true;
      options.value.removeNewlines = false;
      options.value.removeComments = false;
      options.value.removeEmptyValues = false;
      break;
    case 'standard':
      options.value.removeWhitespace = true;
      options.value.removeNewlines = true;
      options.value.removeComments = true;
      options.value.removeEmptyValues = false;
      break;
    case 'aggressive':
      options.value.removeWhitespace = true;
      options.value.removeNewlines = true;
      options.value.removeComments = true;
      options.value.removeEmptyValues = true;
      break;
  }
}

function removeJsonComments(jsonString: string): string {
  // 简单的注释移除（不处理字符串内的注释）
  return jsonString
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除 /* */ 注释
    .replace(/\/\/.*$/gm, ''); // 移除 // 注释
}

function removeEmptyValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeEmptyValues).filter((item) => item !== null && item !== undefined && item !== '');
  } else if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    Object.keys(obj).forEach((key) => {
      const value = removeEmptyValues(obj[key]);
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }
  return obj;
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

function analyzeCompression(original: string, compressed: string) {
  const originalLines = original.split('\n');
  const compressedLines = compressed.split('\n');

  const statistics = {
    whitespaceRemoved: (original.match(/\s/g) || []).length - (compressed.match(/\s/g) || []).length,
    newlinesRemoved: originalLines.length - compressedLines.length,
    commentsRemoved: (original.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm) || []).length,
    emptyValuesRemoved: 0 // 这个需要更复杂的分析
  };

  const removedItems = statistics.whitespaceRemoved + statistics.newlinesRemoved + statistics.commentsRemoved;

  let suggestion = '已达到最佳压缩';
  if (compressionRatio.value && compressionRatio.value < 10) {
    suggestion = '可尝试移除空值进一步压缩';
  } else if (compressionRatio.value && compressionRatio.value < 30) {
    suggestion = '压缩效果良好';
  }

  analysis.value = {
    type: Array.isArray(JSON.parse(compressed)) ? 'Array' : 'Object',
    removedItems,
    suggestion,
    statistics
  };
}

function getCompressionLevelText(level: string): string {
  switch (level) {
    case 'minimal':
      return '最小压缩';
    case 'standard':
      return '标准压缩';
    case 'aggressive':
      return '激进压缩';
    default:
      return '自定义';
  }
}

function optimizeForSize() {
  options.value.compressionLevel = 'aggressive';
  options.value.removeWhitespace = true;
  options.value.removeNewlines = true;
  options.value.removeComments = true;
  options.value.removeEmptyValues = true;
  options.value.sortKeys = true;
  minifyJson();
}

function optimizeForSpeed() {
  options.value.compressionLevel = 'minimal';
  options.value.removeWhitespace = true;
  options.value.removeNewlines = false;
  options.value.removeComments = false;
  options.value.removeEmptyValues = false;
  options.value.sortKeys = false;
  minifyJson();
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

function compareWithOriginal() {
  if (!inputText.value || !outputText.value) return;
  showComparison.value = true;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function loadSampleJson() {
  inputText.value = `{
  "name": "张三",
  "age": 28,
  "city": "北京",
  "skills": [
    "JavaScript",
    "Vue.js", 
    "Node.js"
  ],
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
  "description": "",
  "projects": [
    {
      "name": "项目A",
      "status": "completed",
      "duration": 6,
      "team": []
    },
    {
      "name": "项目B", 
      "status": "in-progress",
      "duration": 3,
      "notes": null
    }
  ]
}`;

  if (options.value.autoMinify) {
    minifyJson();
  }
}

function clearAll() {
  inputText.value = '';
  outputText.value = '';
  error.value = '';
  analysis.value = null;
  isValidJson.value = null;
  showComparison.value = false;
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

  const filename = 'minified.json';
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

    if (options.value.autoMinify) {
      minifyJson();
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

    if (options.value.autoMinify) {
      minifyJson();
    }
  };
  reader.readAsText(file);
}

function addToHistory(input: string, output: string, operation: string, ratio: number) {
  const historyItem: CompressionHistory = {
    input,
    output,
    operation,
    ratio,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 50) + (input.length > 50 ? '...' : '')
  };

  compressionHistory.value.unshift(historyItem);
  compressionHistory.value = compressionHistory.value.slice(0, 10);
  saveCompressionHistory();
}

function loadFromHistory(history: CompressionHistory) {
  inputText.value = history.input;
  outputText.value = history.output;
}

function clearHistory() {
  compressionHistory.value = [];
  saveCompressionHistory();
}

function saveCompressionHistory() {
  try {
    localStorage.setItem('json-compression-history', JSON.stringify(compressionHistory.value));
  } catch (error) {
    console.error('保存压缩历史失败:', error);
  }
}

function loadCompressionHistory() {
  try {
    const saved = localStorage.getItem('json-compression-history');
    if (saved) {
      compressionHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载压缩历史失败:', error);
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue';

onMounted(() => {
  loadCompressionHistory();
});
</script>
