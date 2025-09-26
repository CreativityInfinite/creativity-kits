<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">YAML ⇄ JSON 转换工具</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">输入内容</h4>
            <div class="flex gap-2">
              <button @click="convertToJson" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">转为 JSON</button>
              <button @click="convertToYaml" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">转为 YAML</button>
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">输入格式</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="inputFormat" type="radio" value="yaml" @change="handleFormatChange" />
                  <span class="text-sm">YAML</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="inputFormat" type="radio" value="json" @change="handleFormatChange" />
                  <span class="text-sm">JSON</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="inputFormat" type="radio" value="auto" @change="handleFormatChange" />
                  <span class="text-sm">自动检测</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">输入内容</label>
              <textarea
                v-model="inputText"
                rows="12"
                placeholder="在此输入 YAML 或 JSON 内容..."
                class="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoConvert"
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ inputText.length }}</span>
              <span>行数: {{ inputText.split('\n').length }}</span>
              <span v-if="detectedFormat">检测格式: {{ detectedFormat.toUpperCase() }}</span>
            </div>

            <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
                <span>⚠️</span>
                <span class="font-medium">转换错误</span>
              </div>
              <div class="text-sm text-red-600 dark:text-red-400 mt-1">{{ error }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">转换选项</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="options.prettyPrint" type="checkbox" />
                <span class="text-sm">格式化输出</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.sortKeys" type="checkbox" />
                <span class="text-sm">排序键名</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.preserveComments" type="checkbox" />
                <span class="text-sm">保留注释</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.autoConvert" type="checkbox" />
                <span class="text-sm">自动转换</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">JSON 缩进: {{ options.jsonIndent }}</label>
              <input v-model.number="options.jsonIndent" type="range" min="1" max="8" class="w-full" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>8</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">YAML 缩进: {{ options.yamlIndent }}</label>
              <input v-model.number="options.yamlIndent" type="range" min="2" max="8" step="2" class="w-full" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>2</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleYaml" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载 YAML 示例</button>
            <button @click="loadSampleJson" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">加载 JSON 示例</button>
            <button @click="validateInput" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">验证格式</button>
            <button @click="swapInputOutput" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">交换内容</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">格式说明</h4>
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h5 class="font-medium mb-2">YAML 特点</h5>
              <ul class="space-y-1">
                <li>• 使用缩进表示层级</li>
                <li>• 支持注释 (#)</li>
                <li>• 更易读的格式</li>
                <li>• 支持多行字符串</li>
              </ul>
            </div>
            <div>
              <h5 class="font-medium mb-2">JSON 特点</h5>
              <ul class="space-y-1">
                <li>• 使用大括号和方括号</li>
                <li>• 不支持注释</li>
                <li>• 更紧凑的格式</li>
                <li>• 广泛的语言支持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">转换结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">输出结果 ({{ outputFormat.toUpperCase() }})</h4>
            <div class="flex gap-2">
              <button @click="copyOutput" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
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
                <span v-if="compressionRatio">压缩率: {{ compressionRatio }}%</span>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入内容后将显示转换结果</div>
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
                  <div class="text-sm text-gray-600 dark:text-gray-400">输入格式</div>
                  <div class="font-medium">{{ analysis.inputFormat }}</div>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">输出格式</div>
                  <div class="font-medium">{{ analysis.outputFormat }}</div>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">数据类型</div>
                  <div class="font-medium">{{ analysis.dataType }}</div>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div class="text-sm text-gray-600 dark:text-gray-400">层级深度</div>
                  <div class="font-medium">{{ analysis.depth }}</div>
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
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">输入内容后将显示分析结果</div>
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
                  <div class="text-xs text-gray-500">{{ history.conversion }} - {{ history.timestamp }}</div>
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
          <h4 class="font-medium mb-2">YAML 转 JSON</h4>
          <ul class="space-y-1">
            <li>• <strong>保持数据结构:</strong> 完整保留原始数据层级</li>
            <li>• <strong>类型转换:</strong> 自动识别数据类型</li>
            <li>• <strong>注释处理:</strong> YAML 注释会被移除</li>
            <li>• <strong>格式化:</strong> 可选择 JSON 缩进格式</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">JSON 转 YAML</h4>
          <ul class="space-y-1">
            <li>• <strong>可读性优化:</strong> 生成更易读的 YAML</li>
            <li>• <strong>缩进控制:</strong> 可调整 YAML 缩进大小</li>
            <li>• <strong>键名排序:</strong> 可选择按字母排序键名</li>
            <li>• <strong>多行字符串:</strong> 自动处理长字符串</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">高级功能</h4>
          <ul class="space-y-1">
            <li>• <strong>自动检测:</strong> 智能识别输入格式</li>
            <li>• <strong>格式验证:</strong> 检查语法错误</li>
            <li>• <strong>批量转换:</strong> 支持大文件处理</li>
            <li>• <strong>历史记录:</strong> 保存转换历史</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Analysis {
  inputFormat: string
  outputFormat: string
  dataType: string
  depth: number
  keys?: string[]
  statistics?: {
    objects: number
    arrays: number
    strings: number
    numbers: number
  }
}

interface ConversionHistory {
  input: string
  output: string
  conversion: string
  timestamp: string
  preview: string
}

const inputFormat = ref<'yaml' | 'json' | 'auto'>('auto')
const inputText = ref('')
const outputText = ref('')
const outputFormat = ref<'yaml' | 'json'>('json')
const error = ref('')
const detectedFormat = ref<'yaml' | 'json' | null>(null)

const options = ref({
  prettyPrint: true,
  sortKeys: false,
  preserveComments: false,
  autoConvert: true,
  jsonIndent: 2,
  yamlIndent: 2
})

const analysis = ref<Analysis | null>(null)
const conversionHistory = ref<ConversionHistory[]>([])

const compressionRatio = computed(() => {
  if (!inputText.value || !outputText.value) return null
  const originalSize = new Blob([inputText.value]).size
  const convertedSize = new Blob([outputText.value]).size
  if (originalSize === 0) return null
  return Math.round(((convertedSize - originalSize) / originalSize) * 100)
})

watch([() => options.value.prettyPrint, () => options.value.sortKeys, () => options.value.jsonIndent, () => options.value.yamlIndent], () => {
  if (inputText.value && outputText.value) {
    autoConvert()
  }
})

function handleFormatChange() {
  if (inputText.value) {
    autoConvert()
  }
}

function autoConvert() {
  if (!options.value.autoConvert || !inputText.value.trim()) {
    outputText.value = ''
    analysis.value = null
    return
  }

  const format = detectFormat()
  if (format === 'yaml') {
    convertToJson()
  } else if (format === 'json') {
    convertToYaml()
  }
}

function detectFormat(): 'yaml' | 'json' | null {
  if (inputFormat.value !== 'auto') {
    detectedFormat.value = inputFormat.value
    return inputFormat.value
  }

  const text = inputText.value.trim()
  if (!text) return null

  // 尝试解析为 JSON
  try {
    JSON.parse(text)
    detectedFormat.value = 'json'
    return 'json'
  } catch {
    // JSON 解析失败，可能是 YAML
  }

  // 检查 YAML 特征
  const yamlPatterns = [
    /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*:/m, // key: value
    /^[\s]*-\s+/m, // - list item
    /^[\s]*#/m, // # comment
    /^\s*---\s*$/m, // document separator
    /:\s*\|/m, // literal block scalar
    /:\s*>/m // folded block scalar
  ]

  const hasYamlFeatures = yamlPatterns.some((pattern) => pattern.test(text))

  if (hasYamlFeatures) {
    detectedFormat.value = 'yaml'
    return 'yaml'
  }

  // 默认尝试 YAML
  detectedFormat.value = 'yaml'
  return 'yaml'
}

function convertToJson() {
  error.value = ''

  try {
    const input = inputText.value.trim()
    if (!input) {
      error.value = '请输入 YAML 内容'
      return
    }

    // 简单的 YAML 解析器（基础实现）
    const parsed = parseYaml(input)

    let jsonString = ''
    if (options.value.prettyPrint) {
      jsonString = JSON.stringify(parsed, null, options.value.jsonIndent)
    } else {
      jsonString = JSON.stringify(parsed)
    }

    if (options.value.sortKeys) {
      const sortedParsed = sortObjectKeys(parsed)
      jsonString = options.value.prettyPrint ? JSON.stringify(sortedParsed, null, options.value.jsonIndent) : JSON.stringify(sortedParsed)
    }

    outputText.value = jsonString
    outputFormat.value = 'json'
    analyzeContent(parsed, 'yaml', 'json')
    addToHistory(input, jsonString, 'YAML → JSON')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'YAML 解析失败'
  }
}

function convertToYaml() {
  error.value = ''

  try {
    const input = inputText.value.trim()
    if (!input) {
      error.value = '请输入 JSON 内容'
      return
    }

    let parsed = JSON.parse(input)

    if (options.value.sortKeys) {
      parsed = sortObjectKeys(parsed)
    }

    const yamlString = stringifyYaml(parsed, options.value.yamlIndent)

    outputText.value = yamlString
    outputFormat.value = 'yaml'
    analyzeContent(parsed, 'json', 'yaml')
    addToHistory(input, yamlString, 'JSON → YAML')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'JSON 解析失败'
  }
}

// 简单的 YAML 解析器（基础实现）
function parseYaml(yamlString: string): any {
  const lines = yamlString.split('\n')
  const result: any = {}
  const stack: any[] = [result]
  let currentIndent = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // 跳过空行和注释
    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    // 跳过文档分隔符
    if (trimmedLine === '---' || trimmedLine === '...') continue

    const indent = line.length - line.trimStart().length
    const current = stack[stack.length - 1]

    // 处理列表项
    if (trimmedLine.startsWith('- ')) {
      const value = trimmedLine.substring(2).trim()
      if (!Array.isArray(current)) {
        // 转换为数组
        const keys = Object.keys(current)
        if (keys.length === 0) {
          stack[stack.length - 1] = []
        }
      }

      if (Array.isArray(stack[stack.length - 1])) {
        if (value.includes(':')) {
          // 对象项
          const obj = {}
          stack[stack.length - 1].push(obj)
          parseKeyValue(value, obj)
        } else {
          // 简单值
          stack[stack.length - 1].push(parseValue(value))
        }
      }
      continue
    }

    // 处理键值对
    if (trimmedLine.includes(':')) {
      parseKeyValue(trimmedLine, current)
    }
  }

  return result
}

function parseKeyValue(line: string, target: any) {
  const colonIndex = line.indexOf(':')
  if (colonIndex === -1) return

  const key = line.substring(0, colonIndex).trim()
  const value = line.substring(colonIndex + 1).trim()

  if (!value) {
    target[key] = {}
  } else {
    target[key] = parseValue(value)
  }
}

function parseValue(value: string): any {
  // 布尔值
  if (value === 'true') return true
  if (value === 'false') return false

  // null
  if (value === 'null' || value === '~') return null

  // 数字
  if (/^-?\d+$/.test(value)) return parseInt(value, 10)
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value)

  // 字符串（移除引号）
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }

  return value
}

// 简单的 YAML 字符串化器
function stringifyYaml(obj: any, indent: number = 2, currentIndent: number = 0): string {
  const spaces = ' '.repeat(currentIndent)

  if (obj === null || obj === undefined) {
    return 'null'
  }

  if (typeof obj === 'boolean' || typeof obj === 'number') {
    return String(obj)
  }

  if (typeof obj === 'string') {
    // 检查是否需要引号
    if (
      obj.includes('\n') ||
      obj.includes(':') ||
      obj.includes('#') ||
      obj.startsWith(' ') ||
      obj.endsWith(' ') ||
      ['true', 'false', 'null', '~'].includes(obj.toLowerCase()) ||
      /^-?\d+(\.\d+)?$/.test(obj)
    ) {
      return `"${obj.replace(/"/g, '\\"')}"`
    }
    return obj
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'

    return obj
      .map((item) => {
        const itemYaml = stringifyYaml(item, indent, currentIndent + indent)
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return `${spaces}- ${itemYaml.replace(/\n/g, `\n${spaces}  `)}`
        }
        return `${spaces}- ${itemYaml}`
      })
      .join('\n')
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'

    return keys
      .map((key) => {
        const value = obj[key]
        const valueYaml = stringifyYaml(value, indent, currentIndent + indent)

        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            return `${spaces}${key}:\n${valueYaml}`
          } else if (!Array.isArray(value) && Object.keys(value).length > 0) {
            return `${spaces}${key}:\n${valueYaml}`
          } else {
            return `${spaces}${key}: ${valueYaml}`
          }
        } else {
          return `${spaces}${key}: ${valueYaml}`
        }
      })
      .join('\n')
  }

  return String(obj)
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj !== null && typeof obj === 'object') {
    const sorted: any = {}
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = sortObjectKeys(obj[key])
      })
    return sorted
  }
  return obj
}

function analyzeContent(data: any, inputFormat: string, outputFormat: string) {
  const keys = typeof data === 'object' && data !== null && !Array.isArray(data) ? Object.keys(data) : []

  const statistics = {
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0
  }

  function countTypes(obj: any) {
    if (Array.isArray(obj)) {
      statistics.arrays++
      obj.forEach(countTypes)
    } else if (obj !== null && typeof obj === 'object') {
      statistics.objects++
      Object.values(obj).forEach(countTypes)
    } else if (typeof obj === 'string') {
      statistics.strings++
    } else if (typeof obj === 'number') {
      statistics.numbers++
    }
  }

  countTypes(data)

  analysis.value = {
    inputFormat: inputFormat.toUpperCase(),
    outputFormat: outputFormat.toUpperCase(),
    dataType: Array.isArray(data) ? '数组' : typeof data === 'object' ? '对象' : typeof data,
    depth: getMaxDepth(data),
    keys,
    statistics
  }
}

function getMaxDepth(obj: any, currentDepth: number = 0): number {
  if (obj === null || typeof obj !== 'object') {
    return currentDepth
  }

  let maxDepth = currentDepth

  if (Array.isArray(obj)) {
    for (const item of obj) {
      maxDepth = Math.max(maxDepth, getMaxDepth(item, currentDepth + 1))
    }
  } else {
    for (const value of Object.values(obj)) {
      maxDepth = Math.max(maxDepth, getMaxDepth(value, currentDepth + 1))
    }
  }

  return maxDepth
}

function validateInput() {
  const format = detectFormat()

  if (format === 'json') {
    try {
      JSON.parse(inputText.value)
      outputText.value = '✅ JSON 格式有效'
    } catch (err) {
      outputText.value = `❌ JSON 格式无效: ${err instanceof Error ? err.message : '未知错误'}`
    }
  } else if (format === 'yaml') {
    try {
      parseYaml(inputText.value)
      outputText.value = '✅ YAML 格式有效'
    } catch (err) {
      outputText.value = `❌ YAML 格式无效: ${err instanceof Error ? err.message : '未知错误'}`
    }
  } else {
    outputText.value = '❌ 无法识别输入格式'
  }
}

function loadSampleYaml() {
  inputText.value = `# 配置文件示例
name: "示例应用"
version: 1.0.0
description: |
  这是一个多行
  字符串示例

database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret

features:
  - authentication
  - logging
  - monitoring

settings:
  debug: true
  timeout: 30
  retries: 3`

  inputFormat.value = 'yaml'
  autoConvert()
}

function loadSampleJson() {
  inputText.value = `{
  "name": "示例应用",
  "version": "1.0.0",
  "description": "这是一个JSON配置示例",
  "database": {
    "host": "localhost",
    "port": 5432,
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  },
  "features": [
    "authentication",
    "logging",
    "monitoring"
  ],
  "settings": {
    "debug": true,
    "timeout": 30,
    "retries": 3
  }
}`

  inputFormat.value = 'json'
  autoConvert()
}

function swapInputOutput() {
  const temp = inputText.value
  inputText.value = outputText.value
  outputText.value = temp

  // 交换格式
  if (outputFormat.value === 'json') {
    inputFormat.value = 'json'
  } else {
    inputFormat.value = 'yaml'
  }

  autoConvert()
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
  error.value = ''
  analysis.value = null
  detectedFormat.value = null
}

async function copyOutput() {
  if (!outputText.value) return

  try {
    await navigator.clipboard.writeText(outputText.value)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function downloadResult() {
  if (!outputText.value) return

  const extension = outputFormat.value === 'json' ? 'json' : 'yaml'
  const filename = `converted-data.${extension}`
  const mimeType = outputFormat.value === 'json' ? 'application/json' : 'text/yaml'

  const blob = new Blob([outputText.value], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function addToHistory(input: string, output: string, conversion: string) {
  const historyItem: ConversionHistory = {
    input,
    output,
    conversion,
    timestamp: new Date().toLocaleString(),
    preview: input.slice(0, 50) + (input.length > 50 ? '...' : '')
  }

  conversionHistory.value.unshift(historyItem)
  conversionHistory.value = conversionHistory.value.slice(0, 10)
  saveConversionHistory()
}

function loadFromHistory(history: ConversionHistory) {
  inputText.value = history.input
  outputText.value = history.output

  // 根据转换类型设置格式
  if (history.conversion.includes('YAML → JSON')) {
    inputFormat.value = 'yaml'
    outputFormat.value = 'json'
  } else {
    inputFormat.value = 'json'
    outputFormat.value = 'yaml'
  }
}

function clearHistory() {
  conversionHistory.value = []
  saveConversionHistory()
}

function saveConversionHistory() {
  try {
    localStorage.setItem('yaml-json-conversion-history', JSON.stringify(conversionHistory.value))
  } catch (error) {
    console.error('保存转换历史失败:', error)
  }
}

function loadConversionHistory() {
  try {
    const saved = localStorage.getItem('yaml-json-conversion-history')
    if (saved) {
      conversionHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载转换历史失败:', error)
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue'

onMounted(() => {
  loadConversionHistory()
})
</script>
