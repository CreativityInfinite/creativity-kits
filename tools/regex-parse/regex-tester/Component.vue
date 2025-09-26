<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">正则表达式测试器</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">正则表达式</h4>
            <div class="flex gap-2">
              <button @click="clearRegex" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="relative">
              <input
                v-model="regexPattern"
                type="text"
                placeholder="输入正则表达式..."
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testRegex"
              />
              <div class="absolute right-2 top-2 text-xs text-gray-500">/{{ regexPattern }}/{{ regexFlags }}</div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-2">标志</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input v-model="flags.global" type="checkbox" @change="updateFlags" />
                    <span class="text-sm">g - 全局匹配</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="flags.ignoreCase" type="checkbox" @change="updateFlags" />
                    <span class="text-sm">i - 忽略大小写</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="flags.multiline" type="checkbox" @change="updateFlags" />
                    <span class="text-sm">m - 多行模式</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="flags.dotAll" type="checkbox" @change="updateFlags" />
                    <span class="text-sm">s - 单行模式</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="flags.unicode" type="checkbox" @change="updateFlags" />
                    <span class="text-sm">u - Unicode</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="flags.sticky" type="checkbox" @change="updateFlags" />
                    <span class="text-sm">y - 粘性匹配</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">测试模式</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input v-model="options.testMode" type="radio" value="match" />
                    <span class="text-sm">匹配测试</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.testMode" type="radio" value="replace" />
                    <span class="text-sm">替换测试</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.testMode" type="radio" value="split" />
                    <span class="text-sm">分割测试</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.testMode" type="radio" value="extract" />
                    <span class="text-sm">提取测试</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="options.testMode === 'replace'" class="space-y-2">
              <label class="block text-sm font-medium">替换文本</label>
              <input
                v-model="replaceText"
                type="text"
                placeholder="输入替换文本..."
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testRegex"
              />
              <div class="text-xs text-gray-500">支持捕获组引用：$1, $2, $&（完整匹配）, $`（匹配前）, $'（匹配后）</div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">测试文本</h4>
            <div class="flex gap-2">
              <button @click="clearText" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="testText"
                rows="8"
                placeholder="在此输入要测试的文本..."
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testRegex"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ testText.length }}</span>
              <span>行数: {{ testText.split('\n').length }}</span>
              <span>字节数: {{ getByteLength(testText) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleRegex" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="testManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">手动测试</button>
            <button @click="explainRegex" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">解释正则</button>
            <button @click="validateRegex" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">验证语法</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">常用正则</h4>
          <div class="grid grid-cols-1 gap-2">
            <button v-for="(pattern, name) in commonPatterns" :key="name" @click="loadPattern(pattern, name)" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm text-left">
              <div class="font-medium">{{ name }}</div>
              <div class="text-xs opacity-75 font-mono">{{ pattern.regex }}</div>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.log,.csv,.json" @change="handleFileUpload" class="hidden" />
              上传文件
            </label>
            <button @click="downloadResults" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载结果</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">测试结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">匹配结果</h4>
            <div class="flex gap-2">
              <button @click="copyResults" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制结果</button>
              <button @click="highlightMatches" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">高亮显示</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="testResult" class="space-y-3">
              <div class="flex justify-between items-center text-sm">
                <span class="font-medium">匹配状态:</span>
                <span :class="testResult.isMatch ? 'text-green-600' : 'text-red-600'">
                  {{ testResult.isMatch ? '匹配成功' : '无匹配' }}
                </span>
              </div>

              <div v-if="testResult.isMatch" class="space-y-3">
                <div class="flex justify-between items-center text-sm">
                  <span>匹配数量: {{ testResult.matchCount }}</span>
                  <span>总字符数: {{ testResult.totalChars }}</span>
                </div>

                <div v-if="options.testMode === 'match' && testResult.matches.length > 0" class="space-y-2">
                  <h5 class="font-medium text-sm">匹配详情:</h5>
                  <div class="max-h-64 overflow-y-auto space-y-2">
                    <div v-for="(match, index) in testResult.matches" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">匹配 {{ index + 1 }}</span>
                        <span class="text-xs text-gray-500">位置: {{ match.index }}-{{ match.index + match.match.length }}</span>
                      </div>
                      <div class="font-mono bg-white dark:bg-gray-800 p-2 rounded break-all">
                        {{ match.match }}
                      </div>
                      <div v-if="match.groups && match.groups.length > 0" class="mt-2">
                        <div class="text-xs font-medium mb-1">捕获组:</div>
                        <div class="space-y-1">
                          <div v-for="(group, groupIndex) in match.groups" :key="groupIndex" class="flex justify-between text-xs">
                            <span>组 {{ groupIndex + 1 }}:</span>
                            <span class="font-mono">{{ group || '(空)' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="options.testMode === 'replace' && testResult.replaceResult" class="space-y-2">
                  <h5 class="font-medium text-sm">替换结果:</h5>
                  <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm font-mono max-h-64 overflow-y-auto break-all">
                    <pre>{{ testResult.replaceResult }}</pre>
                  </div>
                </div>

                <div v-if="options.testMode === 'split' && testResult.splitResult" class="space-y-2">
                  <h5 class="font-medium text-sm">分割结果 ({{ testResult.splitResult.length }} 部分):</h5>
                  <div class="max-h-64 overflow-y-auto space-y-1">
                    <div v-for="(part, index) in testResult.splitResult" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">部分 {{ index + 1 }}</span>
                        <span class="text-xs text-gray-500">长度: {{ part.length }}</span>
                      </div>
                      <div class="font-mono bg-white dark:bg-gray-800 p-2 rounded break-all">
                        {{ part || '(空)' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="options.testMode === 'extract' && testResult.extractResult" class="space-y-2">
                  <h5 class="font-medium text-sm">提取结果 ({{ testResult.extractResult.length }} 项):</h5>
                  <div class="max-h-64 overflow-y-auto space-y-1">
                    <div v-for="(item, index) in testResult.extractResult" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm font-mono break-all">
                      {{ item }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="regexError" class="text-center py-8">
              <div class="text-red-600 mb-2">正则表达式错误</div>
              <div class="text-sm text-gray-500">{{ regexError }}</div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入正则表达式和测试文本后将显示结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="highlightedText">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">高亮显示</h4>
          </div>
          <div class="p-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm font-mono max-h-64 overflow-y-auto break-all">
              <div v-html="highlightedText"></div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="regexExplanation">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">正则表达式解释</h4>
          </div>
          <div class="p-4">
            <div class="space-y-2 text-sm">
              <div v-for="(explanation, index) in regexExplanation" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex justify-between items-center">
                  <span class="font-mono">{{ explanation.pattern }}</span>
                  <span class="text-gray-500">{{ explanation.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">测试历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="testHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in testHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.pattern }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.matches }} 匹配</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无测试历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">正则标志</h4>
          <ul class="space-y-1">
            <li>• <strong>g:</strong> 全局匹配，查找所有匹配项</li>
            <li>• <strong>i:</strong> 忽略大小写</li>
            <li>• <strong>m:</strong> 多行模式，^ 和 $ 匹配行首行尾</li>
            <li>• <strong>s:</strong> 单行模式，. 匹配换行符</li>
            <li>• <strong>u:</strong> Unicode 模式</li>
            <li>• <strong>y:</strong> 粘性匹配</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">测试模式</h4>
          <ul class="space-y-1">
            <li>• <strong>匹配测试:</strong> 查找所有匹配项和捕获组</li>
            <li>• <strong>替换测试:</strong> 使用正则进行文本替换</li>
            <li>• <strong>分割测试:</strong> 使用正则分割文本</li>
            <li>• <strong>提取测试:</strong> 提取所有匹配的文本</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">特殊字符</h4>
          <ul class="space-y-1">
            <li>• <strong>.</strong> 匹配任意字符（除换行符）</li>
            <li>• <strong>*</strong> 匹配 0 次或多次</li>
            <li>• <strong>+</strong> 匹配 1 次或多次</li>
            <li>• <strong>?</strong> 匹配 0 次或 1 次</li>
            <li>• <strong>^</strong> 匹配行首</li>
            <li>• <strong>$</strong> 匹配行尾</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface TestOptions {
  testMode: 'match' | 'replace' | 'split' | 'extract'
}

interface RegexFlags {
  global: boolean
  ignoreCase: boolean
  multiline: boolean
  dotAll: boolean
  unicode: boolean
  sticky: boolean
}

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

interface TestResult {
  isMatch: boolean
  matchCount: number
  totalChars: number
  matches: MatchResult[]
  replaceResult?: string
  splitResult?: string[]
  extractResult?: string[]
}

interface TestHistory {
  pattern: string
  flags: string
  text: string
  timestamp: string
  matches: number
}

interface RegexExplanation {
  pattern: string
  description: string
}

interface CommonPattern {
  regex: string
  flags: string
  description: string
  sample: string
}

const regexPattern = ref('')
const testText = ref('')
const replaceText = ref('')
const regexError = ref('')
const highlightedText = ref('')
const regexExplanation = ref<RegexExplanation[]>([])

const flags = ref<RegexFlags>({
  global: true,
  ignoreCase: false,
  multiline: false,
  dotAll: false,
  unicode: false,
  sticky: false
})

const options = ref<TestOptions>({
  testMode: 'match'
})

const testHistory = ref<TestHistory[]>([])
const testResult = ref<TestResult | null>(null)

const regexFlags = computed(() => {
  let flagStr = ''
  if (flags.value.global) flagStr += 'g'
  if (flags.value.ignoreCase) flagStr += 'i'
  if (flags.value.multiline) flagStr += 'm'
  if (flags.value.dotAll) flagStr += 's'
  if (flags.value.unicode) flagStr += 'u'
  if (flags.value.sticky) flagStr += 'y'
  return flagStr
})

const commonPatterns: Record<string, CommonPattern> = {
  邮箱地址: {
    regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'i',
    description: '匹配标准邮箱地址格式',
    sample: 'user@example.com'
  },
  手机号码: {
    regex: '^1[3-9]\\d{9}$',
    flags: '',
    description: '匹配中国大陆手机号码',
    sample: '13812345678'
  },
  URL地址: {
    regex: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    flags: 'gi',
    description: '匹配HTTP/HTTPS URL',
    sample: 'https://www.example.com'
  },
  IP地址: {
    regex: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    flags: '',
    description: '匹配IPv4地址',
    sample: '192.168.1.1'
  },
  身份证号: {
    regex: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
    flags: '',
    description: '匹配18位身份证号码',
    sample: '110101199001011234'
  },
  中文字符: {
    regex: '[\\u4e00-\\u9fa5]+',
    flags: 'g',
    description: '匹配中文字符',
    sample: '你好世界'
  },
  数字: {
    regex: '-?\\d+(\\.\\d+)?',
    flags: 'g',
    description: '匹配整数和小数',
    sample: '123.45'
  },
  日期格式: {
    regex: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}',
    flags: 'g',
    description: '匹配YYYY-MM-DD或YYYY/MM/DD格式日期',
    sample: '2024-01-01'
  }
}

watch([regexPattern, testText, replaceText, () => options.value.testMode], () => {
  if (regexPattern.value && testText.value) {
    testRegex()
  }
})

function updateFlags() {
  if (regexPattern.value && testText.value) {
    testRegex()
  }
}

function testRegex() {
  if (!regexPattern.value || !testText.value) {
    testResult.value = null
    regexError.value = ''
    highlightedText.value = ''
    return
  }

  try {
    regexError.value = ''
    const regex = new RegExp(regexPattern.value, regexFlags.value)

    switch (options.value.testMode) {
      case 'match':
        testResult.value = performMatch(regex)
        break
      case 'replace':
        testResult.value = performReplace(regex)
        break
      case 'split':
        testResult.value = performSplit(regex)
        break
      case 'extract':
        testResult.value = performExtract(regex)
        break
    }

    // 添加到历史记录
    if (testResult.value?.isMatch) {
      addToHistory(regexPattern.value, regexFlags.value, testText.value, testResult.value.matchCount)
    }
  } catch (error) {
    regexError.value = error instanceof Error ? error.message : '正则表达式语法错误'
    testResult.value = null
    highlightedText.value = ''
  }
}

function performMatch(regex: RegExp): TestResult {
  const matches: MatchResult[] = []
  let match: RegExpExecArray | null
  let totalChars = 0

  if (regex.global) {
    while ((match = regex.exec(testText.value)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1)
      })
      totalChars += match[0].length

      // 防止无限循环
      if (match[0].length === 0) {
        regex.lastIndex++
      }
    }
  } else {
    match = regex.exec(testText.value)
    if (match) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1)
      })
      totalChars = match[0].length
    }
  }

  return {
    isMatch: matches.length > 0,
    matchCount: matches.length,
    totalChars,
    matches
  }
}

function performReplace(regex: RegExp): TestResult {
  const replaceStr = replaceText.value || ''
  const result = testText.value.replace(regex, replaceStr)
  const matches = testText.value.match(regex) || []

  return {
    isMatch: matches.length > 0,
    matchCount: matches.length,
    totalChars: matches.reduce((sum, match) => sum + match.length, 0),
    matches: [],
    replaceResult: result
  }
}

function performSplit(regex: RegExp): TestResult {
  const parts = testText.value.split(regex)
  const matches = testText.value.match(regex) || []

  return {
    isMatch: matches.length > 0,
    matchCount: matches.length,
    totalChars: matches.reduce((sum, match) => sum + match.length, 0),
    matches: [],
    splitResult: parts
  }
}

function performExtract(regex: RegExp): TestResult {
  const matches = testText.value.match(regex) || []

  return {
    isMatch: matches.length > 0,
    matchCount: matches.length,
    totalChars: matches.reduce((sum, match) => sum + match.length, 0),
    matches: [],
    extractResult: matches
  }
}

function highlightMatches() {
  if (!regexPattern.value || !testText.value || !testResult.value?.isMatch) {
    highlightedText.value = ''
    return
  }

  try {
    const regex = new RegExp(regexPattern.value, regexFlags.value)
    let highlighted = testText.value
    let offset = 0

    if (regex.global) {
      const matches: RegExpExecArray[] = []
      let match: RegExpExecArray | null

      while ((match = regex.exec(testText.value)) !== null) {
        matches.push(match)
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }

      // 从后往前替换，避免位置偏移
      matches.reverse().forEach((match, index) => {
        const colors = ['bg-yellow-200', 'bg-green-200', 'bg-blue-200', 'bg-pink-200', 'bg-purple-200']
        const color = colors[index % colors.length]
        const replacement = `<span class="${color} px-1 rounded">${escapeHtml(match[0])}</span>`
        highlighted = highlighted.slice(0, match.index) + replacement + highlighted.slice(match.index + match[0].length)
      })
    } else {
      const match = regex.exec(testText.value)
      if (match) {
        const replacement = `<span class="bg-yellow-200 px-1 rounded">${escapeHtml(match[0])}</span>`
        highlighted = highlighted.slice(0, match.index) + replacement + highlighted.slice(match.index + match[0].length)
      }
    }

    highlightedText.value = highlighted.replace(/\n/g, '<br>')
  } catch (error) {
    highlightedText.value = ''
  }
}

function explainRegex() {
  if (!regexPattern.value) {
    regexExplanation.value = []
    return
  }

  const explanations: RegexExplanation[] = []
  const pattern = regexPattern.value

  // 简单的正则解释逻辑
  const explanationMap: Record<string, string> = {
    '.': '匹配任意字符（除换行符）',
    '*': '匹配前面的字符 0 次或多次',
    '+': '匹配前面的字符 1 次或多次',
    '?': '匹配前面的字符 0 次或 1 次',
    '^': '匹配行首',
    $: '匹配行尾',
    '\\d': '匹配数字字符 [0-9]',
    '\\w': '匹配单词字符 [a-zA-Z0-9_]',
    '\\s': '匹配空白字符',
    '\\D': '匹配非数字字符',
    '\\W': '匹配非单词字符',
    '\\S': '匹配非空白字符',
    '\\b': '匹配单词边界',
    '\\B': '匹配非单词边界'
  }

  // 查找特殊字符并解释
  for (const [char, desc] of Object.entries(explanationMap)) {
    if (pattern.includes(char)) {
      explanations.push({ pattern: char, description: desc })
    }
  }

  // 查找字符类
  const charClassRegex = /\[([^\]]+)\]/g
  let match: RegExpExecArray | null
  while ((match = charClassRegex.exec(pattern)) !== null) {
    explanations.push({
      pattern: match[0],
      description: `字符类：匹配 ${match[1]} 中的任意一个字符`
    })
  }

  // 查找量词
  const quantifierRegex = /\{(\d+(?:,\d*)?)\}/g
  while ((match = quantifierRegex.exec(pattern)) !== null) {
    explanations.push({
      pattern: match[0],
      description: `量词：匹配前面的字符 ${match[1]} 次`
    })
  }

  // 查找捕获组
  const groupRegex = /\(([^)]+)\)/g
  let groupIndex = 1
  while ((match = groupRegex.exec(pattern)) !== null) {
    explanations.push({
      pattern: match[0],
      description: `捕获组 ${groupIndex}：${match[1]}`
    })
    groupIndex++
  }

  regexExplanation.value = explanations
}

function validateRegex() {
  if (!regexPattern.value) {
    alert('请先输入正则表达式')
    return
  }

  try {
    new RegExp(regexPattern.value, regexFlags.value)
    alert('正则表达式语法正确')
  } catch (error) {
    alert(`正则表达式语法错误：${error instanceof Error ? error.message : '未知错误'}`)
  }
}

function loadPattern(pattern: CommonPattern, name: string) {
  regexPattern.value = pattern.regex

  // 设置标志
  flags.value.global = pattern.flags.includes('g')
  flags.value.ignoreCase = pattern.flags.includes('i')
  flags.value.multiline = pattern.flags.includes('m')
  flags.value.dotAll = pattern.flags.includes('s')
  flags.value.unicode = pattern.flags.includes('u')
  flags.value.sticky = pattern.flags.includes('y')

  testText.value = pattern.sample

  testRegex()
}

function loadSampleRegex() {
  regexPattern.value = '\\b\\w+@\\w+\\.\\w+\\b'
  flags.value.global = true
  flags.value.ignoreCase = true
  testText.value = '联系我们：admin@example.com 或 support@test.org\n技术支持：tech@company.net'

  testRegex()
}

function testManually() {
  testRegex()
}

function clearRegex() {
  regexPattern.value = ''
  testResult.value = null
  regexError.value = ''
  highlightedText.value = ''
  regexExplanation.value = []
}

function clearText() {
  testText.value = ''
  testResult.value = null
  highlightedText.value = ''
}

async function copyResults() {
  if (!testResult.value) return

  let content = `正则表达式: /${regexPattern.value}/${regexFlags.value}\n`
  content += `测试模式: ${options.value.testMode}\n`
  content += `匹配状态: ${testResult.value.isMatch ? '成功' : '失败'}\n`
  content += `匹配数量: ${testResult.value.matchCount}\n\n`

  if (testResult.value.matches.length > 0) {
    content += '匹配详情:\n'
    testResult.value.matches.forEach((match, index) => {
      content += `${index + 1}. "${match.match}" (位置: ${match.index})\n`
      if (match.groups.length > 0) {
        match.groups.forEach((group, groupIndex) => {
          content += `   组 ${groupIndex + 1}: "${group || '(空)'}"\n`
        })
      }
    })
  }

  if (testResult.value.replaceResult) {
    content += `\n替换结果:\n${testResult.value.replaceResult}`
  }

  if (testResult.value.splitResult) {
    content += `\n分割结果:\n${testResult.value.splitResult.join('\n---\n')}`
  }

  if (testResult.value.extractResult) {
    content += `\n提取结果:\n${testResult.value.extractResult.join('\n')}`
  }

  try {
    await navigator.clipboard.writeText(content)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function downloadResults() {
  if (!testResult.value) return

  const content = `正则表达式测试结果

正则表达式: /${regexPattern.value}/${regexFlags.value}
测试模式: ${options.value.testMode}
匹配状态: ${testResult.value.isMatch ? '成功' : '失败'}
匹配数量: ${testResult.value.matchCount}
总字符数: ${testResult.value.totalChars}

测试文本:
${testText.value}

${
  testResult.value.matches.length > 0
    ? `
匹配详情:
${testResult.value.matches
  .map(
    (match, index) => `${index + 1}. "${match.match}" (位置: ${match.index})${match.groups.length > 0 ? `\n   捕获组: ${match.groups.map((g, i) => `组${i + 1}="${g || '(空)'}"`).join(', ')}` : ''}`
  )
  .join('\n')}`
    : ''
}

${
  testResult.value.replaceResult
    ? `
替换结果:
${testResult.value.replaceResult}`
    : ''
}

${
  testResult.value.splitResult
    ? `
分割结果:
${testResult.value.splitResult.map((part, index) => `部分${index + 1}: "${part}"`).join('\n')}`
    : ''
}

${
  testResult.value.extractResult
    ? `
提取结果:
${testResult.value.extractResult.join('\n')}`
    : ''
}

生成时间: ${new Date().toLocaleString()}
`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'regex-test-results.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    testText.value = content

    if (regexPattern.value) {
      testRegex()
    }
  }
  reader.readAsText(file)
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    testText.value = content

    if (regexPattern.value) {
      testRegex()
    }
  }
  reader.readAsText(file)
}

function addToHistory(pattern: string, flagStr: string, text: string, matches: number) {
  const historyItem: TestHistory = {
    pattern,
    flags: flagStr,
    text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
    timestamp: new Date().toLocaleString(),
    matches
  }

  testHistory.value.unshift(historyItem)
  testHistory.value = testHistory.value.slice(0, 10)
  saveTestHistory()
}

function loadFromHistory(history: TestHistory) {
  regexPattern.value = history.pattern

  // 设置标志
  flags.value.global = history.flags.includes('g')
  flags.value.ignoreCase = history.flags.includes('i')
  flags.value.multiline = history.flags.includes('m')
  flags.value.dotAll = history.flags.includes('s')
  flags.value.unicode = history.flags.includes('u')
  flags.value.sticky = history.flags.includes('y')

  testRegex()
}

function clearHistory() {
  testHistory.value = []
  saveTestHistory()
}

function saveTestHistory() {
  try {
    localStorage.setItem('regex-test-history', JSON.stringify(testHistory.value))
  } catch (error) {
    console.error('保存测试历史失败:', error)
  }
}

function loadTestHistory() {
  try {
    const saved = localStorage.getItem('regex-test-history')
    if (saved) {
      testHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载测试历史失败:', error)
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function getByteLength(str: string): number {
  return new Blob([str]).size
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue'

onMounted(() => {
  loadTestHistory()
})
</script>
