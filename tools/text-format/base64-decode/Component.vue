<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Base64 解码</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">Base64 编码文本</h4>
            <div class="flex gap-2">
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="encodedText"
                rows="8"
                placeholder="在此粘贴需要解码的 Base64 文本..."
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="autoDecode"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>字符数: {{ encodedText.length }}</span>
              <span>行数: {{ encodedText.split('\n').length }}</span>
              <span v-if="isValidBase64" class="text-green-600">✓ 有效的 Base64</span>
              <span v-else-if="encodedText.trim()" class="text-red-600">✗ 无效的 Base64</span>
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
                <input v-model="options.removeWhitespace" type="checkbox" />
                <span class="text-sm">移除空白字符</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.urlSafe" type="checkbox" />
                <span class="text-sm">URL 安全模式</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.strictMode" type="checkbox" />
                <span class="text-sm">严格模式</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">输出格式</label>
              <div class="flex gap-4">
                <label class="flex items-center space-x-2">
                  <input v-model="options.outputFormat" type="radio" value="text" />
                  <span class="text-sm">文本</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.outputFormat" type="radio" value="hex" />
                  <span class="text-sm">十六进制</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input v-model="options.outputFormat" type="radio" value="binary" />
                  <span class="text-sm">二进制</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">字符编码</label>
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
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleData" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="decodeManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">手动解码</button>
            <button @click="validateBase64" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">验证格式</button>
            <button @click="analyzeData" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">数据分析</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.b64,.base64" @change="handleFileUpload" class="hidden" />
              上传文件
            </label>
            <button @click="downloadDecoded" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载解码结果</button>
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
            <div v-if="decodedText" class="space-y-3">
              <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto break-all">
                <pre v-if="options.outputFormat === 'text'">{{ decodedText }}</pre>
                <pre v-else-if="options.outputFormat === 'hex'" class="text-green-600">{{ hexOutput }}</pre>
                <pre v-else-if="options.outputFormat === 'binary'" class="text-blue-600">{{ binaryOutput }}</pre>
              </div>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>解码后字节数: {{ decodedBytes.length }}</span>
                <span>字符数: {{ decodedText.length }}</span>
                <span>行数: {{ decodedText.split('\n').length }}</span>
              </div>
            </div>
            <div v-else-if="error" class="text-center py-8">
              <div class="text-red-600 mb-2">解码失败</div>
              <div class="text-sm text-gray-500">{{ error }}</div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入 Base64 编码文本后将显示解码结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">数据分析</h4>
          </div>
          <div class="p-4">
            <div v-if="analysis" class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>原始大小:</span>
                  <span class="font-mono">{{ formatBytes(encodedText.length) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>解码后大小:</span>
                  <span class="font-mono">{{ formatBytes(decodedBytes.length) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>压缩率:</span>
                  <span class="font-mono">{{ analysis.compressionRatio }}%</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>填充字符:</span>
                  <span class="font-mono">{{ analysis.paddingChars }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>数据类型:</span>
                  <span class="font-mono">{{ analysis.dataType }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>字符集:</span>
                  <span class="font-mono">{{ analysis.charset }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>是否二进制:</span>
                  <span class="font-mono">{{ analysis.isBinary ? '是' : '否' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>熵值:</span>
                  <span class="font-mono">{{ analysis.entropy.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">解码成功后将显示数据分析</div>
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
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ formatBytes(history.size) }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无解码历史</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">文件预览</h4>
          </div>
          <div class="p-4">
            <div v-if="filePreview" class="space-y-3">
              <div v-if="filePreview.type === 'image'" class="text-center">
                <img :src="filePreview.dataUrl" alt="解码图片" class="max-w-full max-h-64 mx-auto rounded border" />
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
            <div v-else class="text-center py-4 text-gray-500">解码后如果是支持的文件格式将显示预览</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">Base64 解码</h4>
          <ul class="space-y-1">
            <li>• <strong>标准 Base64:</strong> 使用 A-Z, a-z, 0-9, +, / 字符</li>
            <li>• <strong>URL 安全:</strong> 使用 - 和 _ 替代 + 和 /</li>
            <li>• <strong>填充字符:</strong> 使用 = 进行填充对齐</li>
            <li>• <strong>自动检测:</strong> 支持多种 Base64 变体</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">输出格式</h4>
          <ul class="space-y-1">
            <li>• <strong>文本:</strong> 解码为可读文本</li>
            <li>• <strong>十六进制:</strong> 显示字节的十六进制表示</li>
            <li>• <strong>二进制:</strong> 显示二进制数据</li>
            <li>• <strong>文件预览:</strong> 支持图片、JSON、XML 等</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">应用场景</h4>
          <ul class="space-y-1">
            <li>• <strong>数据传输:</strong> 解码网络传输的数据</li>
            <li>• <strong>文件处理:</strong> 解码嵌入的文件数据</li>
            <li>• <strong>API 调试:</strong> 解析 API 响应中的编码数据</li>
            <li>• <strong>数据分析:</strong> 分析编码数据的内容和结构</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface DecodeOptions {
  autoDecode: boolean
  removeWhitespace: boolean
  urlSafe: boolean
  strictMode: boolean
  outputFormat: 'text' | 'hex' | 'binary'
  encoding: string
}

interface Analysis {
  compressionRatio: number
  paddingChars: number
  dataType: string
  charset: string
  isBinary: boolean
  entropy: number
}

interface DecodeHistory {
  encoded: string
  decoded: string
  timestamp: string
  preview: string
  size: number
}

interface FilePreview {
  type: 'image' | 'json' | 'xml' | 'text' | 'binary'
  content?: string
  dataUrl?: string
  info: string
}

const encodedText = ref('')
const decodedText = ref('')
const decodedBytes = ref<Uint8Array>(new Uint8Array())
const error = ref('')

const options = ref<DecodeOptions>({
  autoDecode: true,
  removeWhitespace: true,
  urlSafe: false,
  strictMode: false,
  outputFormat: 'text',
  encoding: 'utf-8'
})

const decodeHistory = ref<DecodeHistory[]>([])
const filePreview = ref<FilePreview | null>(null)

const isValidBase64 = computed(() => {
  if (!encodedText.value.trim()) return false
  return validateBase64Format(encodedText.value)
})

const hexOutput = computed(() => {
  if (!decodedBytes.value.length) return ''
  return Array.from(decodedBytes.value)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
})

const binaryOutput = computed(() => {
  if (!decodedBytes.value.length) return ''
  return Array.from(decodedBytes.value)
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ')
})

const analysis = computed((): Analysis | null => {
  if (!encodedText.value.trim() || !decodedBytes.value.length) return null

  const originalSize = encodedText.value.length
  const decodedSize = decodedBytes.value.length
  const compressionRatio = Math.round(((originalSize - decodedSize) / originalSize) * 100)

  const paddingChars = (encodedText.value.match(/=/g) || []).length

  // 检测数据类型
  let dataType = 'Unknown'
  const firstBytes = Array.from(decodedBytes.value.slice(0, 8))

  if (firstBytes[0] === 0xff && firstBytes[1] === 0xd8) {
    dataType = 'JPEG Image'
  } else if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4e && firstBytes[3] === 0x47) {
    dataType = 'PNG Image'
  } else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && firstBytes[2] === 0x46) {
    dataType = 'GIF Image'
  } else if (firstBytes[0] === 0x25 && firstBytes[1] === 0x50 && firstBytes[2] === 0x44 && firstBytes[3] === 0x46) {
    dataType = 'PDF Document'
  } else if (decodedText.value.trim().startsWith('{') || decodedText.value.trim().startsWith('[')) {
    dataType = 'JSON Data'
  } else if (decodedText.value.trim().startsWith('<')) {
    dataType = 'XML/HTML Data'
  } else if (/^[\x20-\x7E\s]*$/.test(decodedText.value)) {
    dataType = 'Text Data'
  } else {
    dataType = 'Binary Data'
  }

  // 检测字符集
  const charset = detectCharset(decodedBytes.value)

  // 检测是否为二进制数据
  const isBinary = decodedBytes.value.some((byte) => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)

  // 计算熵值
  const entropy = calculateEntropy(decodedBytes.value)

  return {
    compressionRatio,
    paddingChars,
    dataType,
    charset,
    isBinary,
    entropy
  }
})

watch(
  [() => options.value],
  () => {
    if (encodedText.value && options.value.autoDecode) {
      performDecode()
    }
  },
  { deep: true }
)

function autoDecode() {
  if (!options.value.autoDecode || !encodedText.value.trim()) {
    clearResults()
    return
  }

  performDecode()
}

function performDecode() {
  if (!encodedText.value.trim()) {
    clearResults()
    return
  }

  try {
    error.value = ''

    let input = encodedText.value

    // 移除空白字符
    if (options.value.removeWhitespace) {
      input = input.replace(/\s/g, '')
    }

    // URL 安全模式转换
    if (options.value.urlSafe) {
      input = input.replace(/-/g, '+').replace(/_/g, '/')
    }

    // 验证 Base64 格式
    if (options.value.strictMode && !validateBase64Format(input)) {
      throw new Error('无效的 Base64 格式')
    }

    // 解码
    const decoded = atob(input)
    const bytes = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i)
    }

    decodedBytes.value = bytes

    // 根据编码格式转换文本
    decodedText.value = decodeToText(bytes, options.value.encoding)

    // 生成文件预览
    generateFilePreview(bytes, decodedText.value)

    // 添加到历史记录
    addToHistory(encodedText.value, decodedText.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '解码失败'
    decodedText.value = ''
    decodedBytes.value = new Uint8Array()
    filePreview.value = null
  }
}

function validateBase64Format(text: string): boolean {
  // 移除空白字符
  const cleaned = text.replace(/\s/g, '')

  // 检查长度是否为4的倍数
  if (cleaned.length % 4 !== 0) return false

  // 检查字符是否有效
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  const urlSafeRegex = /^[A-Za-z0-9\-_]*={0,2}$/

  return base64Regex.test(cleaned) || urlSafeRegex.test(cleaned)
}

function decodeToText(bytes: Uint8Array, encoding: string): string {
  try {
    const decoder = new TextDecoder(encoding)
    return decoder.decode(bytes)
  } catch {
    // 如果解码失败，尝试 UTF-8
    try {
      const decoder = new TextDecoder('utf-8')
      return decoder.decode(bytes)
    } catch {
      // 如果还是失败，返回原始字符串
      return String.fromCharCode(...bytes)
    }
  }
}

function detectCharset(bytes: Uint8Array): string {
  // 简单的字符集检测
  const hasHighBytes = bytes.some((byte) => byte > 127)

  if (!hasHighBytes) {
    return 'ASCII'
  }

  // 检测 UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'UTF-8 (BOM)'
  }

  // 检测 UTF-16 BOM
  if (bytes.length >= 2) {
    if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)) {
      return 'UTF-16 (BOM)'
    }
  }

  return 'UTF-8'
}

function calculateEntropy(bytes: Uint8Array): number {
  const frequency = new Array(256).fill(0)

  for (const byte of bytes) {
    frequency[byte]++
  }

  let entropy = 0
  const length = bytes.length

  for (const count of frequency) {
    if (count > 0) {
      const probability = count / length
      entropy -= probability * Math.log2(probability)
    }
  }

  return entropy
}

function generateFilePreview(bytes: Uint8Array, text: string) {
  filePreview.value = null

  // 检测图片
  if (bytes.length > 8) {
    const header = Array.from(bytes.slice(0, 8))

    if (
      (header[0] === 0xff && header[1] === 0xd8) || // JPEG
      (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) || // PNG
      (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46)
    ) {
      // GIF

      const blob = new Blob([bytes])
      const dataUrl = URL.createObjectURL(blob)

      filePreview.value = {
        type: 'image',
        dataUrl,
        info: `图片文件 (${formatBytes(bytes.length)})`
      }
      return
    }
  }

  // 检测 JSON
  try {
    const trimmed = text.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      JSON.parse(trimmed)
      filePreview.value = {
        type: 'json',
        content: JSON.stringify(JSON.parse(trimmed), null, 2),
        info: `JSON 数据 (${formatBytes(bytes.length)})`
      }
      return
    }
  } catch {
    // 不是有效的 JSON
  }

  // 检测 XML
  if (text.trim().startsWith('<') && text.trim().includes('>')) {
    filePreview.value = {
      type: 'xml',
      content: text,
      info: `XML/HTML 数据 (${formatBytes(bytes.length)})`
    }
    return
  }

  // 检测文本
  const isBinary = bytes.some((byte) => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)
  if (!isBinary) {
    filePreview.value = {
      type: 'text',
      content: text,
      info: `文本数据 (${formatBytes(bytes.length)})`
    }
  } else {
    filePreview.value = {
      type: 'binary',
      info: `二进制数据 (${formatBytes(bytes.length)})`
    }
  }
}

function clearResults() {
  decodedText.value = ''
  decodedBytes.value = new Uint8Array()
  error.value = ''
  filePreview.value = null
}

function loadSampleData() {
  // 示例：编码的 JSON 数据
  encodedText.value =
    'eyJuYW1lIjoi5byg5LiJIiwiYWdlIjoyNSwiZW1haWwiOiJ6aGFuZ3NhbkBleGFtcGxlLmNvbSIsImhvYmJpZXMiOlsi6ZiF6K+7Iiwi5ri45oiPIiwi5peF6KGMIl0sImFkZHJlc3MiOnsiY2l0eSI6IuWMl+S6rCIsImNvdW50cnkiOiLkuK3lm70ifX0='

  if (options.value.autoDecode) {
    performDecode()
  }
}

function decodeManually() {
  performDecode()
}

function validateBase64() {
  const isValid = validateBase64Format(encodedText.value)
  const message = isValid ? 'Base64 格式有效' : 'Base64 格式无效'
  alert(message)
}

function analyzeData() {
  if (!analysis.value) {
    alert('请先输入并解码 Base64 数据')
    return
  }

  const stats = analysis.value
  const message = `数据分析结果:
数据类型: ${stats.dataType}
字符集: ${stats.charset}
是否二进制: ${stats.isBinary ? '是' : '否'}
压缩率: ${stats.compressionRatio}%
填充字符数: ${stats.paddingChars}
熵值: ${stats.entropy.toFixed(2)}
原始大小: ${formatBytes(encodedText.value.length)}
解码后大小: ${formatBytes(decodedBytes.value.length)}`

  alert(message)
}

function clearAll() {
  encodedText.value = ''
  clearResults()
}

async function copyResult() {
  if (!decodedText.value) return

  try {
    await navigator.clipboard.writeText(decodedText.value)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function encodeResult() {
  if (!decodedText.value) return

  try {
    const encoded = btoa(decodedText.value)
    encodedText.value = encoded
  } catch (error) {
    console.error('编码失败:', error)
  }
}

function downloadDecoded() {
  if (!decodedBytes.value.length) return

  const blob = new Blob([decodedBytes.value])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'decoded-data.bin'
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
    encodedText.value = content

    if (options.value.autoDecode) {
      performDecode()
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
    encodedText.value = content

    if (options.value.autoDecode) {
      performDecode()
    }
  }
  reader.readAsText(file)
}

function addToHistory(encoded: string, decoded: string) {
  const historyItem: DecodeHistory = {
    encoded,
    decoded,
    timestamp: new Date().toLocaleString(),
    preview: decoded.slice(0, 50) + (decoded.length > 50 ? '...' : ''),
    size: decodedBytes.value.length
  }

  decodeHistory.value.unshift(historyItem)
  decodeHistory.value = decodeHistory.value.slice(0, 10)
  saveDecodeHistory()
}

function loadFromHistory(history: DecodeHistory) {
  encodedText.value = history.encoded
  decodedText.value = history.decoded
}

function clearHistory() {
  decodeHistory.value = []
  saveDecodeHistory()
}

function saveDecodeHistory() {
  try {
    localStorage.setItem('base64-decode-history', JSON.stringify(decodeHistory.value))
  } catch (error) {
    console.error('保存解码历史失败:', error)
  }
}

function loadDecodeHistory() {
  try {
    const saved = localStorage.getItem('base64-decode-history')
    if (saved) {
      decodeHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载解码历史失败:', error)
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue'

onMounted(() => {
  loadDecodeHistory()
})
</script>
