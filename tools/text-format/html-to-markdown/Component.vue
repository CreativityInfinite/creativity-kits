<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">HTML 输入</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">HTML 代码</label>
            <textarea
              v-model="htmlInput"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="粘贴或输入 HTML 代码..."
            />
            <div class="text-xs text-gray-500 mt-1">字符数: {{ htmlInput.length }}</div>
          </div>

          <div class="flex gap-2">
            <button @click="convert" :disabled="!htmlInput.trim()" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">🔄 转换为 Markdown</button>
            <button @click="clear" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">🗑️ 清空</button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="loadExample" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">📝 加载示例</button>
            <button @click="pasteFromClipboard" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">📋 从剪贴板粘贴</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">转换选项</h4>
          <div class="space-y-3">
            <label class="flex items-center gap-2">
              <input v-model="options.preserveWhitespace" type="checkbox" class="rounded" />
              <span class="text-sm">保留空白字符</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="options.convertImages" type="checkbox" class="rounded" />
              <span class="text-sm">转换图片标签</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="options.convertLinks" type="checkbox" class="rounded" />
              <span class="text-sm">转换链接</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="options.convertTables" type="checkbox" class="rounded" />
              <span class="text-sm">转换表格</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="options.convertCodeBlocks" type="checkbox" class="rounded" />
              <span class="text-sm">转换代码块</span>
            </label>
            <label class="flex items-center gap-2">
              <input v-model="options.removeComments" type="checkbox" class="rounded" />
              <span class="text-sm">移除 HTML 注释</span>
            </label>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">Markdown 输出</h3>

        <div v-if="markdownOutput" class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium">转换结果</label>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">📋 复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">💾 下载</button>
              </div>
            </div>
            <textarea v-model="markdownOutput" rows="12" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" readonly />
            <div class="text-xs text-gray-500 mt-1">字符数: {{ markdownOutput.length }} | 行数: {{ markdownOutput.split('\n').length }}</div>
          </div>

          <div class="flex gap-2">
            <button @click="showPreview = !showPreview" class="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
              {{ showPreview ? '隐藏预览' : '📖 预览' }}
            </button>
            <button @click="validateMarkdown" class="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">✅ 验证语法</button>
          </div>

          <div v-if="showPreview" class="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <h5 class="font-medium mb-2">Markdown 预览</h5>
            <div class="prose dark:prose-invert max-w-none" v-html="previewHtml"></div>
          </div>
        </div>

        <div v-if="!markdownOutput" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">📝</div>
          <div class="text-lg mb-2">HTML 转 Markdown</div>
          <div class="text-sm">输入 HTML 代码，点击转换按钮</div>
        </div>

        <div v-if="conversionStats" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 class="font-medium mb-2">转换统计</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">处理时间:</span>
              <span>{{ conversionStats.processingTime }}ms</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">HTML 标签:</span>
              <span>{{ conversionStats.htmlTags }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">转换的链接:</span>
              <span>{{ conversionStats.linksConverted }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">转换的图片:</span>
              <span>{{ conversionStats.imagesConverted }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">转换的表格:</span>
              <span>{{ conversionStats.tablesConverted }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">代码块:</span>
              <span>{{ conversionStats.codeBlocks }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="validationResult" class="bg-white dark:bg-gray-800 border rounded-lg p-4">
      <h4 class="font-medium mb-3">Markdown 语法验证</h4>
      <div v-if="validationResult.isValid" class="text-green-600 dark:text-green-400">✅ Markdown 语法正确</div>
      <div v-else class="space-y-2">
        <div class="text-red-600 dark:text-red-400">❌ 发现语法问题:</div>
        <ul class="list-disc list-inside text-sm space-y-1">
          <li v-for="issue in validationResult.issues" :key="issue" class="text-red-600 dark:text-red-400">
            {{ issue }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="history.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">转换历史 ({{ history.length }})</h4>
        <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
      </div>
      <div class="p-4">
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div v-for="(item, index) in history.slice(0, 10)" :key="index" class="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div class="flex justify-between items-start mb-2">
              <div class="text-sm font-medium">{{ formatTime(item.timestamp) }}</div>
              <div class="flex gap-1">
                <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                <button @click="copyResult(item.markdown)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制</button>
              </div>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">HTML: {{ item.htmlLength }} 字符 → Markdown: {{ item.markdownLength }} 字符</div>
            <div class="text-xs font-mono bg-white dark:bg-gray-800 rounded p-2 truncate">{{ item.markdown.substring(0, 100) }}{{ item.markdown.length > 100 ? '...' : '' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">功能说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">支持转换</h4>
          <ul class="space-y-1">
            <li>• 标题 (h1-h6) → # ## ###</li>
            <li>• 段落和换行</li>
            <li>• 粗体和斜体</li>
            <li>• 链接和图片</li>
            <li>• 列表 (有序/无序)</li>
            <li>• 表格</li>
            <li>• 代码和代码块</li>
            <li>• 引用块</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">特点</h4>
          <ul class="space-y-1">
            <li>• 智能格式化</li>
            <li>• 保留语义结构</li>
            <li>• 可配置转换选项</li>
            <li>• 实时预览</li>
            <li>• 语法验证</li>
            <li>• 转换历史记录</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ConversionOptions {
  preserveWhitespace: boolean
  convertImages: boolean
  convertLinks: boolean
  convertTables: boolean
  convertCodeBlocks: boolean
  removeComments: boolean
}

interface ConversionStats {
  processingTime: number
  htmlTags: number
  linksConverted: number
  imagesConverted: number
  tablesConverted: number
  codeBlocks: number
}

interface ValidationResult {
  isValid: boolean
  issues: string[]
}

interface HistoryItem {
  html: string
  markdown: string
  htmlLength: number
  markdownLength: number
  timestamp: number
}

const htmlInput = ref('')
const markdownOutput = ref('')
const showPreview = ref(false)
const conversionStats = ref<ConversionStats | null>(null)
const validationResult = ref<ValidationResult | null>(null)
const history = ref<HistoryItem[]>([])

const options = ref<ConversionOptions>({
  preserveWhitespace: false,
  convertImages: true,
  convertLinks: true,
  convertTables: true,
  convertCodeBlocks: true,
  removeComments: true
})

const previewHtml = computed(() => {
  if (!markdownOutput.value) return ''
  return convertMarkdownToHtml(markdownOutput.value)
})

// HTML 转 Markdown 核心函数
const convert = () => {
  if (!htmlInput.value.trim()) return

  const startTime = performance.now()

  let html = htmlInput.value
  let stats: ConversionStats = {
    processingTime: 0,
    htmlTags: 0,
    linksConverted: 0,
    imagesConverted: 0,
    tablesConverted: 0,
    codeBlocks: 0
  }

  // 移除注释
  if (options.value.removeComments) {
    html = html.replace(/<!--[\s\S]*?-->/g, '')
  }

  // 统计 HTML 标签
  stats.htmlTags = (html.match(/<[^>]+>/g) || []).length

  let markdown = html

  // 转换标题
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const cleanContent = cleanHtml(content)
    return '#'.repeat(parseInt(level)) + ' ' + cleanContent + '\n\n'
  })

  // 转换粗体
  markdown = markdown.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**')

  // 转换斜体
  markdown = markdown.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*')

  // 转换链接
  if (options.value.convertLinks) {
    markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, (match, href, text) => {
      stats.linksConverted++
      return `[${cleanHtml(text)}](${href})`
    })
  }

  // 转换图片
  if (options.value.convertImages) {
    markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, (match, src, alt) => {
      stats.imagesConverted++
      return `![${alt}](${src})`
    })
    markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, (match, src) => {
      stats.imagesConverted++
      return `![](${src})`
    })
  }

  // 转换代码块
  if (options.value.convertCodeBlocks) {
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
      stats.codeBlocks++
      return '```\n' + cleanHtml(code) + '\n```\n\n'
    })
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
  }

  // 转换引用
  markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, content) => {
    const lines = cleanHtml(content).split('\n')
    return lines.map((line) => (line.trim() ? '> ' + line : '>')).join('\n') + '\n\n'
  })

  // 转换无序列表
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
    return (
      items
        .map((item) => {
          const text = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1')
          return '- ' + cleanHtml(text).trim()
        })
        .join('\n') + '\n\n'
    )
  })

  // 转换有序列表
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || []
    return (
      items
        .map((item, index) => {
          const text = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1')
          return `${index + 1}. ` + cleanHtml(text).trim()
        })
        .join('\n') + '\n\n'
    )
  })

  // 转换表格
  if (options.value.convertTables) {
    markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, content) => {
      stats.tablesConverted++
      return convertHtmlTable(content)
    })
  }

  // 转换段落
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content) => {
    return cleanHtml(content).trim() + '\n\n'
  })

  // 转换换行
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')

  // 清理剩余的 HTML 标签
  markdown = cleanHtml(markdown)

  // 处理空白字符
  if (!options.value.preserveWhitespace) {
    markdown = markdown.replace(/\n{3,}/g, '\n\n') // 限制连续换行
    markdown = markdown.replace(/[ \t]+/g, ' ') // 合并空格
  }

  markdown = markdown.trim()

  const endTime = performance.now()
  stats.processingTime = Math.round(endTime - startTime)

  markdownOutput.value = markdown
  conversionStats.value = stats

  // 添加到历史记录
  addToHistory(htmlInput.value, markdown)
}

// 转换 HTML 表格
const convertHtmlTable = (tableHtml: string): string => {
  const rows = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []
  if (rows.length === 0) return ''

  const markdownRows: string[] = []
  let isFirstRow = true

  rows.forEach((row) => {
    const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || []
    const cellTexts = cells.map((cell) => {
      const text = cell.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/i, '$1')
      return cleanHtml(text).trim()
    })

    if (cellTexts.length > 0) {
      markdownRows.push('| ' + cellTexts.join(' | ') + ' |')

      if (isFirstRow) {
        // 添加表头分隔符
        markdownRows.push('| ' + cellTexts.map(() => '---').join(' | ') + ' |')
        isFirstRow = false
      }
    }
  })

  return markdownRows.join('\n') + '\n\n'
}

// 清理 HTML 标签
const cleanHtml = (html: string): string => {
  return html
    .replace(/<[^>]+>/g, '') // 移除所有 HTML 标签
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// 简单的 Markdown 转 HTML（用于预览）
const convertMarkdownToHtml = (markdown: string): string => {
  let html = markdown

  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // 粗体和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // 代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 段落
  html = html.replace(/\n\n/g, '</p><p>')
  html = '<p>' + html + '</p>'

  return html
}

// 验证 Markdown 语法
const validateMarkdown = () => {
  if (!markdownOutput.value) return

  const issues: string[] = []
  const markdown = markdownOutput.value

  // 检查链接语法
  const linkMatches = markdown.match(/\[([^\]]*)\]\(([^)]*)\)/g)
  if (linkMatches) {
    linkMatches.forEach((link) => {
      if (!link.match(/\[.*\]\(.+\)/)) {
        issues.push(`链接语法错误: ${link}`)
      }
    })
  }

  // 检查图片语法
  const imageMatches = markdown.match(/!\[([^\]]*)\]\(([^)]*)\)/g)
  if (imageMatches) {
    imageMatches.forEach((image) => {
      if (!image.match(/!\[.*\]\(.+\)/)) {
        issues.push(`图片语法错误: ${image}`)
      }
    })
  }

  // 检查代码块
  const codeBlockMatches = markdown.match(/```[\s\S]*?```/g)
  if (codeBlockMatches) {
    codeBlockMatches.forEach((block) => {
      if (!block.endsWith('```')) {
        issues.push('代码块未正确闭合')
      }
    })
  }

  validationResult.value = {
    isValid: issues.length === 0,
    issues
  }
}

// 其他功能函数
const clear = () => {
  htmlInput.value = ''
  markdownOutput.value = ''
  conversionStats.value = null
  validationResult.value = null
  showPreview.value = false
}

const loadExample = () => {
  htmlInput.value = `<!DOCTYPE html>
<html>
<head>
    <title>示例文档</title>
</head>
<body>
    <h1>主标题</h1>
    <p>这是一个<strong>粗体</strong>和<em>斜体</em>的示例段落。</p>
    
    <h2>链接和图片</h2>
    <p>访问 <a href="https://example.com">示例网站</a></p>
    <img src="https://via.placeholder.com/150" alt="示例图片" />
    
    <h3>列表</h3>
    <ul>
        <li>无序列表项 1</li>
        <li>无序列表项 2</li>
    </ul>
    
    <ol>
        <li>有序列表项 1</li>
        <li>有序列表项 2</li>
    </ol>
    
    <h3>代码</h3>
    <p>内联代码: <code>console.log('Hello')</code></p>
    <pre><code>function hello() {
    console.log('Hello World!');
}</code></pre>
    
    <h3>表格</h3>
    <table>
        <tr>
            <th>姓名</th>
            <th>年龄</th>
        </tr>
        <tr>
            <td>张三</td>
            <td>25</td>
        </tr>
        <tr>
            <td>李四</td>
            <td>30</td>
        </tr>
    </table>
    
    <blockquote>
        <p>这是一个引用块的示例。</p>
    </blockquote>
</body>
</html>`
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    htmlInput.value = text
  } catch (error) {
    console.error('无法从剪贴板读取:', error)
  }
}

const copyResult = (text?: string) => {
  const textToCopy = text || markdownOutput.value
  if (!textToCopy) return

  navigator.clipboard.writeText(textToCopy).then(() => {
    // 可以添加成功提示
  })
}

const downloadResult = () => {
  if (!markdownOutput.value) return

  const blob = new Blob([markdownOutput.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.md'
  a.click()
  URL.revokeObjectURL(url)
}

const addToHistory = (html: string, markdown: string) => {
  const item: HistoryItem = {
    html,
    markdown,
    htmlLength: html.length,
    markdownLength: markdown.length,
    timestamp: Date.now()
  }

  history.value.unshift(item)

  // 限制历史记录数量
  if (history.value.length > 20) {
    history.value = history.value.slice(0, 20)
  }
}

const loadFromHistory = (item: HistoryItem) => {
  htmlInput.value = item.html
  markdownOutput.value = item.markdown
}

const clearHistory = () => {
  history.value = []
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
