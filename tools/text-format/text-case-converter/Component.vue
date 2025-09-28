<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">文本大小写转换</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">输入文本</h4>
            <div class="flex gap-2">
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="inputText"
                rows="8"
                placeholder="在此输入需要转换的文本..."
                class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoConvert"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ inputText.length }}</span>
              <span>单词数: {{ wordCount }}</span>
              <span>行数: {{ inputText.split('\n').length }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">转换选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.preserveNumbers" type="checkbox" />
                <span class="text-sm">保留数字</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.preserveSpecialChars" type="checkbox" />
                <span class="text-sm">保留特殊字符</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.preserveSpaces" type="checkbox" />
                <span class="text-sm">保留空格</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.autoConvert" type="checkbox" />
                <span class="text-sm">自动转换</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">驼峰命名分隔符</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="options.camelCaseSeparator" type="radio" value="space" />
                  <span class="text-sm">空格</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.camelCaseSeparator" type="radio" value="underscore" />
                  <span class="text-sm">下划线</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.camelCaseSeparator" type="radio" value="hyphen" />
                  <span class="text-sm">连字符</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleText" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="reverseText" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">反转文本</button>
            <button @click="removeExtraSpaces" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">清理空格</button>
            <button @click="countCharacters" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">字符统计</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.md,.csv" @change="handleFileUpload" class="hidden" />
              上传文件
            </label>
            <button @click="downloadAllResults" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载全部</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">转换结果</h3>

        <div class="space-y-3">
          <!-- 大写 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">大写 (UPPERCASE)</h4>
              <button @click="copyResult('uppercase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.uppercase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 小写 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">小写 (lowercase)</h4>
              <button @click="copyResult('lowercase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.lowercase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 标题格式 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">标题格式 (Title Case)</h4>
              <button @click="copyResult('titleCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.titleCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 句子格式 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">句子格式 (Sentence case)</h4>
              <button @click="copyResult('sentenceCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.sentenceCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 驼峰命名 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">驼峰命名 (camelCase)</h4>
              <button @click="copyResult('camelCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.camelCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 帕斯卡命名 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">帕斯卡命名 (PascalCase)</h4>
              <button @click="copyResult('pascalCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.pascalCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 蛇形命名 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">蛇形命名 (snake_case)</h4>
              <button @click="copyResult('snakeCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.snakeCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 烤肉串命名 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">烤肉串命名 (kebab-case)</h4>
              <button @click="copyResult('kebabCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.kebabCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 常量命名 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">常量命名 (CONSTANT_CASE)</h4>
              <button @click="copyResult('constantCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.constantCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>

          <!-- 点分命名 -->
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
              <h4 class="font-medium">点分命名 (dot.case)</h4>
              <button @click="copyResult('dotCase')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
            </div>
            <div class="p-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[60px] break-all">
                {{ results.dotCase || '转换结果将显示在这里...' }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">文本分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>总字符数:</span>
                  <span class="font-mono">{{ analysis.totalChars }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>字母数:</span>
                  <span class="font-mono">{{ analysis.letters }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>数字数:</span>
                  <span class="font-mono">{{ analysis.numbers }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>空格数:</span>
                  <span class="font-mono">{{ analysis.spaces }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>单词数:</span>
                  <span class="font-mono">{{ analysis.words }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>句子数:</span>
                  <span class="font-mono">{{ analysis.sentences }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>段落数:</span>
                  <span class="font-mono">{{ analysis.paragraphs }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>特殊字符:</span>
                  <span class="font-mono">{{ analysis.specialChars }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">输入文本后将显示分析结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">转换历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="conversionHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in conversionHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.preview }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无转换历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">基础转换</h4>
          <ul class="space-y-1">
            <li>• <strong>大写:</strong> 所有字母转为大写</li>
            <li>• <strong>小写:</strong> 所有字母转为小写</li>
            <li>• <strong>标题格式:</strong> 每个单词首字母大写</li>
            <li>• <strong>句子格式:</strong> 句首字母大写</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">编程命名</h4>
          <ul class="space-y-1">
            <li>• <strong>驼峰命名:</strong> firstName, lastName</li>
            <li>• <strong>帕斯卡命名:</strong> FirstName, LastName</li>
            <li>• <strong>蛇形命名:</strong> first_name, last_name</li>
            <li>• <strong>烤肉串命名:</strong> first-name, last-name</li>
            <li>• <strong>常量命名:</strong> FIRST_NAME, LAST_NAME</li>
            <li>• <strong>点分命名:</strong> first.name, last.name</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">应用场景</h4>
          <ul class="space-y-1">
            <li>• <strong>代码编写:</strong> 变量和函数命名</li>
            <li>• <strong>文档编辑:</strong> 标题和格式调整</li>
            <li>• <strong>数据处理:</strong> 批量文本转换</li>
            <li>• <strong>内容创作:</strong> 文本格式统一</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Analysis {
  totalChars: number;
  letters: number;
  numbers: number;
  spaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  specialChars: number;
}

interface ConversionHistory {
  input: string;
  results: Record<string, string>;
  timestamp: string;
  preview: string;
}

interface Results {
  uppercase: string;
  lowercase: string;
  titleCase: string;
  sentenceCase: string;
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
  dotCase: string;
}

const inputText = ref('');

const options = ref({
  preserveNumbers: true,
  preserveSpecialChars: true,
  preserveSpaces: true,
  autoConvert: true,
  camelCaseSeparator: 'space' as 'space' | 'underscore' | 'hyphen'
});

const results = ref<Results>({
  uppercase: '',
  lowercase: '',
  titleCase: '',
  sentenceCase: '',
  camelCase: '',
  pascalCase: '',
  snakeCase: '',
  kebabCase: '',
  constantCase: '',
  dotCase: ''
});

const conversionHistory = ref<ConversionHistory[]>([]);

const wordCount = computed(() => {
  if (!inputText.value.trim()) return 0;
  return inputText.value.trim().split(/\s+/).length;
});

const analysis = computed((): Analysis | null => {
  if (!inputText.value) return null;

  const text = inputText.value;
  const totalChars = text.length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const numbers = (text.match(/\d/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const specialChars = totalChars - letters - numbers - spaces;

  return {
    totalChars,
    letters,
    numbers,
    spaces,
    words,
    sentences,
    paragraphs,
    specialChars
  };
});

watch(
  [() => options.value],
  () => {
    if (inputText.value && options.value.autoConvert) {
      convertAllCases();
    }
  },
  { deep: true }
);

function autoConvert() {
  if (!options.value.autoConvert || !inputText.value.trim()) {
    clearResults();
    return;
  }

  convertAllCases();
}

function convertAllCases() {
  if (!inputText.value.trim()) {
    clearResults();
    return;
  }

  const text = inputText.value;

  results.value = {
    uppercase: convertToUppercase(text),
    lowercase: convertToLowercase(text),
    titleCase: convertToTitleCase(text),
    sentenceCase: convertToSentenceCase(text),
    camelCase: convertToCamelCase(text),
    pascalCase: convertToPascalCase(text),
    snakeCase: convertToSnakeCase(text),
    kebabCase: convertToKebabCase(text),
    constantCase: convertToConstantCase(text),
    dotCase: convertToDotCase(text)
  };

  addToHistory(text, results.value);
}

function convertToUppercase(text: string): string {
  return text.toUpperCase();
}

function convertToLowercase(text: string): string {
  return text.toLowerCase();
}

function convertToTitleCase(text: string): string {
  // 不需要大写的小词
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];

  return text.toLowerCase().replace(/\b\w+/g, (word, index) => {
    // 第一个单词总是大写，其他小词保持小写
    if (index === 0 || !smallWords.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  });
}

function convertToSentenceCase(text: string): string {
  return text.toLowerCase().replace(/(^\w|[.!?]\s*\w)/g, (match) => {
    return match.toUpperCase();
  });
}

function convertToCamelCase(text: string): string {
  const separator = getSeparator();
  const words = splitIntoWords(text, separator);

  return words
    .map((word, index) => {
      const cleanWord = cleanWord(word);
      if (index === 0) {
        return cleanWord.toLowerCase();
      }
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .join('');
}

function convertToPascalCase(text: string): string {
  const separator = getSeparator();
  const words = splitIntoWords(text, separator);

  return words
    .map((word) => {
      const cleanWord = cleanWord(word);
      return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    })
    .join('');
}

function convertToSnakeCase(text: string): string {
  const separator = getSeparator();
  const words = splitIntoWords(text, separator);

  return words.map((word) => cleanWord(word).toLowerCase()).join('_');
}

function convertToKebabCase(text: string): string {
  const separator = getSeparator();
  const words = splitIntoWords(text, separator);

  return words.map((word) => cleanWord(word).toLowerCase()).join('-');
}

function convertToConstantCase(text: string): string {
  const separator = getSeparator();
  const words = splitIntoWords(text, separator);

  return words.map((word) => cleanWord(word).toUpperCase()).join('_');
}

function convertToDotCase(text: string): string {
  const separator = getSeparator();
  const words = splitIntoWords(text, separator);

  return words.map((word) => cleanWord(word).toLowerCase()).join('.');
}

function getSeparator(): string {
  switch (options.value.camelCaseSeparator) {
    case 'underscore':
      return '_';
    case 'hyphen':
      return '-';
    default:
      return ' ';
  }
}

function splitIntoWords(text: string, separator: string): string[] {
  // 处理驼峰命名的拆分
  let processedText = text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // 驼峰拆分
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2'); // 连续大写字母拆分

  // 根据分隔符和其他常见分隔符拆分
  const splitPattern = new RegExp(`[${separator}\\s\\-_\\.]+`, 'g');

  return processedText.split(splitPattern).filter((word) => word.trim().length > 0);
}

function cleanWord(word: string): string {
  let cleaned = word.trim();

  if (!options.value.preserveNumbers) {
    cleaned = cleaned.replace(/\d/g, '');
  }

  if (!options.value.preserveSpecialChars) {
    cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, '');
  }

  return cleaned;
}

function clearResults() {
  results.value = {
    uppercase: '',
    lowercase: '',
    titleCase: '',
    sentenceCase: '',
    camelCase: '',
    pascalCase: '',
    snakeCase: '',
    kebabCase: '',
    constantCase: '',
    dotCase: ''
  };
}

function loadSampleText() {
  inputText.value = `Hello World Example
this is a sample text for case conversion
firstName lastName
user-name and user_email
API_KEY and DATABASE_URL
some.config.value
Mixed CamelCase and snake_case text
Multiple    spaces   and	tabs
Special characters: @#$%^&*()
Numbers: 123 and ABC123XYZ`;

  if (options.value.autoConvert) {
    convertAllCases();
  }
}

function reverseText() {
  if (!inputText.value) return;
  inputText.value = inputText.value.split('').reverse().join('');

  if (options.value.autoConvert) {
    convertAllCases();
  }
}

function removeExtraSpaces() {
  if (!inputText.value) return;
  inputText.value = inputText.value
    .replace(/\s+/g, ' ') // 多个空格替换为单个空格
    .replace(/^\s+|\s+$/g, ''); // 移除首尾空格

  if (options.value.autoConvert) {
    convertAllCases();
  }
}

function countCharacters() {
  if (!inputText.value) return;

  const stats = analysis.value;
  if (!stats) return;

  const message = `文本统计:
总字符数: ${stats.totalChars}
字母数: ${stats.letters}
数字数: ${stats.numbers}
空格数: ${stats.spaces}
单词数: ${stats.words}
句子数: ${stats.sentences}
段落数: ${stats.paragraphs}
特殊字符数: ${stats.specialChars}`;

  alert(message);
}

function clearAll() {
  inputText.value = '';
  clearResults();
}

async function copyResult(caseType: keyof Results) {
  const text = results.value[caseType];
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function downloadAllResults() {
  if (!inputText.value) return;

  const content = `原文本:
${inputText.value}

转换结果:
==========

大写 (UPPERCASE):
${results.value.uppercase}

小写 (lowercase):
${results.value.lowercase}

标题格式 (Title Case):
${results.value.titleCase}

句子格式 (Sentence case):
${results.value.sentenceCase}

驼峰命名 (camelCase):
${results.value.camelCase}

帕斯卡命名 (PascalCase):
${results.value.pascalCase}

蛇形命名 (snake_case):
${results.value.snakeCase}

烤肉串命名 (kebab-case):
${results.value.kebabCase}

常量命名 (CONSTANT_CASE):
${results.value.constantCase}

点分命名 (dot.case):
${results.value.dotCase}

生成时间: ${new Date().toLocaleString()}
`;

  const filename = 'case-conversion-results.txt';
  const mimeType = 'text/plain';

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

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    inputText.value = content;

    if (options.value.autoConvert) {
      convertAllCases();
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

    if (options.value.autoConvert) {
      convertAllCases();
    }
  };
  reader.readAsText(file);
}

function addToHistory(input: string, conversionResults: Results) {
  const historyItem: ConversionHistory = {
    input,
    results: conversionResults,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 50) + (input.length > 50 ? '...' : '')
  };

  conversionHistory.value.unshift(historyItem);
  conversionHistory.value = conversionHistory.value.slice(0, 10);
  saveConversionHistory();
}

function loadFromHistory(history: ConversionHistory) {
  inputText.value = history.input;
  results.value = history.results;
}

function clearHistory() {
  conversionHistory.value = [];
  saveConversionHistory();
}

function saveConversionHistory() {
  try {
    localStorage.setItem('text-case-conversion-history', JSON.stringify(conversionHistory.value));
  } catch (error) {
    console.error('保存转换历史失败:', error);
  }
}

function loadConversionHistory() {
  try {
    const saved = localStorage.getItem('text-case-conversion-history');
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
