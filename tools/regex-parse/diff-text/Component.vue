<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">原始文本</h3>
        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">文本 A（原始版本）</label>
            <textarea
              v-model="textA"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="输入或粘贴原始文本..."
            />
            <div class="text-xs text-gray-500 mt-1">行数: {{ textA.split('\n').length }} | 字符数: {{ textA.length }}</div>
          </div>

          <div class="flex gap-2">
            <button @click="loadFileA" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">📁 加载文件</button>
            <button @click="pasteA" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">📋 粘贴</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">修改文本</h3>
        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">文本 B（修改版本）</label>
            <textarea
              v-model="textB"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="输入或粘贴修改后的文本..."
            />
            <div class="text-xs text-gray-500 mt-1">行数: {{ textB.split('\n').length }} | 字符数: {{ textB.length }}</div>
          </div>

          <div class="flex gap-2">
            <button @click="loadFileB" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">📁 加载文件</button>
            <button @click="pasteB" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">📋 粘贴</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-medium text-lg">对比选项</h3>
        <div class="flex gap-2">
          <button @click="compare" :disabled="!textA.trim() || !textB.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">🔍 开始对比</button>
          <button @click="clear" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">🗑️ 清空</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">对比模式</label>
          <select v-model="compareMode" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
            <option value="line">按行对比</option>
            <option value="word">按词对比</option>
            <option value="char">按字符对比</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">显示模式</label>
          <select v-model="displayMode" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
            <option value="side-by-side">并排显示</option>
            <option value="unified">统一显示</option>
            <option value="inline">内联显示</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">上下文行数</label>
          <input v-model.number="contextLines" type="number" min="0" max="10" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
        </div>
      </div>

      <div class="flex flex-wrap gap-4 text-sm">
        <label class="flex items-center gap-2">
          <input v-model="options.ignoreWhitespace" type="checkbox" class="rounded" />
          <span>忽略空白字符</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="options.ignoreCase" type="checkbox" class="rounded" />
          <span>忽略大小写</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="options.ignoreEmptyLines" type="checkbox" class="rounded" />
          <span>忽略空行</span>
        </label>
        <label class="flex items-center gap-2">
          <input v-model="options.showLineNumbers" type="checkbox" class="rounded" />
          <span>显示行号</span>
        </label>
      </div>
    </div>

    <div v-if="diffResult" class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">对比结果</h4>
        <div class="flex gap-2">
          <button @click="exportDiff" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">📤 导出</button>
          <button @click="copyDiff" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">📋 复制</button>
        </div>
      </div>

      <div class="p-4">
        <div v-if="diffStats" class="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">添加:</span>
            <span class="text-green-600 font-medium">+{{ diffStats.additions }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">删除:</span>
            <span class="text-red-600 font-medium">-{{ diffStats.deletions }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">修改:</span>
            <span class="text-blue-600 font-medium">{{ diffStats.modifications }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">相似度:</span>
            <span class="font-medium">{{ diffStats.similarity }}%</span>
          </div>
        </div>

        <div class="diff-container font-mono text-sm" :class="displayMode">
          <div v-if="displayMode === 'side-by-side'" class="grid grid-cols-2 gap-4">
            <div class="border rounded">
              <div class="bg-red-50 dark:bg-red-900/20 px-3 py-2 border-b text-red-800 dark:text-red-200 font-medium">文本 A（原始）</div>
              <div class="p-3 max-h-96 overflow-auto">
                <div v-for="(line, index) in diffResult.left" :key="index" class="diff-line" :class="line.type">
                  <span v-if="options.showLineNumbers" class="line-number">{{ line.lineNumber }}</span>
                  <span class="line-content" v-html="line.content"></span>
                </div>
              </div>
            </div>
            <div class="border rounded">
              <div class="bg-green-50 dark:bg-green-900/20 px-3 py-2 border-b text-green-800 dark:text-green-200 font-medium">文本 B（修改）</div>
              <div class="p-3 max-h-96 overflow-auto">
                <div v-for="(line, index) in diffResult.right" :key="index" class="diff-line" :class="line.type">
                  <span v-if="options.showLineNumbers" class="line-number">{{ line.lineNumber }}</span>
                  <span class="line-content" v-html="line.content"></span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="border rounded">
            <div class="bg-gray-50 dark:bg-gray-700 px-3 py-2 border-b font-medium">统一对比视图</div>
            <div class="p-3 max-h-96 overflow-auto">
              <div v-for="(line, index) in diffResult.unified" :key="index" class="diff-line" :class="line.type">
                <span v-if="options.showLineNumbers" class="line-number">{{ line.lineNumber }}</span>
                <span class="line-prefix">{{ line.prefix }}</span>
                <span class="line-content" v-html="line.content"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!diffResult" class="text-center py-12 text-gray-500">
      <div class="text-4xl mb-4">🔍</div>
      <div class="text-lg mb-2">文本对比工具</div>
      <div class="text-sm">输入两个文本，点击开始对比查看差异</div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">对比模式</h4>
          <ul class="space-y-1">
            <li>• <strong>按行对比</strong>：逐行比较，适合代码和文档</li>
            <li>• <strong>按词对比</strong>：逐词比较，更精细的差异</li>
            <li>• <strong>按字符对比</strong>：字符级别比较</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">显示选项</h4>
          <ul class="space-y-1">
            <li>• <strong>并排显示</strong>：左右对照显示</li>
            <li>• <strong>统一显示</strong>：类似 Git diff 格式</li>
            <li>• <strong>内联显示</strong>：在同一行显示差异</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="fileInputA" type="file" accept=".txt,.md,.js,.css,.html,.json,.xml,.csv" @change="handleFileA" class="hidden" />
    <input ref="fileInputB" type="file" accept=".txt,.md,.js,.css,.html,.json,.xml,.csv" @change="handleFileB" class="hidden" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged' | 'context'
  content: string
  lineNumber?: number
  prefix?: string
}

interface DiffResult {
  left: DiffLine[]
  right: DiffLine[]
  unified: DiffLine[]
}

interface DiffStats {
  additions: number
  deletions: number
  modifications: number
  similarity: number
}

interface CompareOptions {
  ignoreWhitespace: boolean
  ignoreCase: boolean
  ignoreEmptyLines: boolean
  showLineNumbers: boolean
}

const textA = ref('')
const textB = ref('')
const compareMode = ref<'line' | 'word' | 'char'>('line')
const displayMode = ref<'side-by-side' | 'unified' | 'inline'>('side-by-side')
const contextLines = ref(3)
const diffResult = ref<DiffResult | null>(null)
const diffStats = ref<DiffStats | null>(null)
const fileInputA = ref<HTMLInputElement>()
const fileInputB = ref<HTMLInputElement>()

const options = ref<CompareOptions>({
  ignoreWhitespace: false,
  ignoreCase: false,
  ignoreEmptyLines: false,
  showLineNumbers: true
})

// 主要对比函数
const compare = () => {
  if (!textA.value.trim() || !textB.value.trim()) return

  const linesA = preprocessText(textA.value)
  const linesB = preprocessText(textB.value)

  const diff = computeDiff(linesA, linesB)
  const stats = computeStats(diff)

  diffResult.value = formatDiffResult(diff, linesA, linesB)
  diffStats.value = stats
}

// 预处理文本
const preprocessText = (text: string): string[] => {
  let lines = text.split('\n')

  if (options.value.ignoreEmptyLines) {
    lines = lines.filter((line) => line.trim() !== '')
  }

  if (options.value.ignoreWhitespace) {
    lines = lines.map((line) => line.trim())
  }

  if (options.value.ignoreCase) {
    lines = lines.map((line) => line.toLowerCase())
  }

  return lines
}

// 计算差异（简化的 LCS 算法）
const computeDiff = (linesA: string[], linesB: string[]): Array<{ type: string; lineA?: number; lineB?: number; content?: string }> => {
  const m = linesA.length
  const n = linesB.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  // 构建 LCS 表
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // 回溯构建差异
  const diff: Array<{ type: string; lineA?: number; lineB?: number; content?: string }> = []
  let i = m,
    j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      diff.unshift({ type: 'unchanged', lineA: i - 1, lineB: j - 1, content: linesA[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', lineB: j - 1, content: linesB[j - 1] })
      j--
    } else if (i > 0) {
      diff.unshift({ type: 'removed', lineA: i - 1, content: linesA[i - 1] })
      i--
    }
  }

  return diff
}

// 计算统计信息
const computeStats = (diff: Array<{ type: string }>): DiffStats => {
  const additions = diff.filter((d) => d.type === 'added').length
  const deletions = diff.filter((d) => d.type === 'removed').length
  const modifications = Math.min(additions, deletions)
  const unchanged = diff.filter((d) => d.type === 'unchanged').length
  const total = diff.length
  const similarity = total > 0 ? Math.round((unchanged / total) * 100) : 0

  return {
    additions: additions - modifications,
    deletions: deletions - modifications,
    modifications,
    similarity
  }
}

// 格式化差异结果
const formatDiffResult = (diff: Array<{ type: string; lineA?: number; lineB?: number; content?: string }>, linesA: string[], linesB: string[]): DiffResult => {
  const left: DiffLine[] = []
  const right: DiffLine[] = []
  const unified: DiffLine[] = []

  let lineNumA = 1
  let lineNumB = 1

  diff.forEach((item) => {
    const content = escapeHtml(item.content || '')

    switch (item.type) {
      case 'unchanged':
        left.push({ type: 'unchanged', content, lineNumber: lineNumA })
        right.push({ type: 'unchanged', content, lineNumber: lineNumB })
        unified.push({ type: 'unchanged', content, lineNumber: lineNumA, prefix: ' ' })
        lineNumA++
        lineNumB++
        break

      case 'removed':
        left.push({ type: 'removed', content, lineNumber: lineNumA })
        right.push({ type: 'context', content: '', lineNumber: undefined })
        unified.push({ type: 'removed', content, lineNumber: lineNumA, prefix: '-' })
        lineNumA++
        break

      case 'added':
        left.push({ type: 'context', content: '', lineNumber: undefined })
        right.push({ type: 'added', content, lineNumber: lineNumB })
        unified.push({ type: 'added', content, lineNumber: lineNumB, prefix: '+' })
        lineNumB++
        break
    }
  })

  return { left, right, unified }
}

// HTML 转义
const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 文件处理
const loadFileA = () => {
  fileInputA.value?.click()
}

const loadFileB = () => {
  fileInputB.value?.click()
}

const handleFileA = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      textA.value = e.target?.result as string
    }
    reader.readAsText(file)
  }
}

const handleFileB = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      textB.value = e.target?.result as string
    }
    reader.readAsText(file)
  }
}

// 剪贴板操作
const pasteA = async () => {
  try {
    const text = await navigator.clipboard.readText()
    textA.value = text
  } catch (error) {
    console.error('无法从剪贴板读取:', error)
  }
}

const pasteB = async () => {
  try {
    const text = await navigator.clipboard.readText()
    textB.value = text
  } catch (error) {
    console.error('无法从剪贴板读取:', error)
  }
}

const copyDiff = () => {
  if (!diffResult.value) return

  const diffText = diffResult.value.unified
    .map((line) => {
      return `${line.prefix || ' '}${line.content}`
    })
    .join('\n')

  navigator.clipboard.writeText(diffText)
}

const exportDiff = () => {
  if (!diffResult.value) return

  const diffText = diffResult.value.unified
    .map((line) => {
      return `${line.prefix || ' '}${line.content}`
    })
    .join('\n')

  const blob = new Blob([diffText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'diff-result.txt'
  a.click()
  URL.revokeObjectURL(url)
}

const clear = () => {
  textA.value = ''
  textB.value = ''
  diffResult.value = null
  diffStats.value = null
}
</script>

<style scoped>
.diff-line {
  @apply flex items-start min-h-[1.5rem] px-2 py-1;
}

.diff-line.added {
  @apply bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200;
}

.diff-line.removed {
  @apply bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200;
}

.diff-line.modified {
  @apply bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200;
}

.diff-line.unchanged {
  @apply bg-white dark:bg-gray-800;
}

.diff-line.context {
  @apply bg-gray-50 dark:bg-gray-700 opacity-50;
}

.line-number {
  @apply w-12 text-right text-gray-400 mr-3 flex-shrink-0 text-xs;
}

.line-prefix {
  @apply w-4 text-center mr-2 flex-shrink-0 font-bold;
}

.line-content {
  @apply flex-1 whitespace-pre-wrap break-all;
}
</style>
