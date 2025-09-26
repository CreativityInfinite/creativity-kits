<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Markdown 转 HTML</h3>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="block text-sm font-medium">Markdown 输入</label>
            <div class="flex gap-2">
              <button @click="loadSample" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
              <button @click="clearInput" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="relative">
            <textarea
              v-model="markdownInput"
              rows="20"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="在此输入 Markdown 内容..."
              @input="convertToHtml"
              @drop="handleFileDrop"
              @dragover.prevent
              @dragenter.prevent
            />
            <div class="absolute bottom-2 right-2 text-xs text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded">{{ markdownInput.length }} 字符 | {{ markdownInput.split('\n').length }} 行</div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">转换选项</h4>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input v-model="options.breaks" type="checkbox" @change="convertToHtml" />
                <span class="text-sm">启用换行符转换</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.linkify" type="checkbox" @change="convertToHtml" />
                <span class="text-sm">自动链接识别</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.typographer" type="checkbox" @change="convertToHtml" />
                <span class="text-sm">启用排版优化</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.html" type="checkbox" @change="convertToHtml" />
                <span class="text-sm">允许 HTML 标签</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="options.xhtmlOut" type="checkbox" @change="convertToHtml" />
                <span class="text-sm">输出 XHTML</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">文件操作</h4>
            <div class="grid grid-cols-2 gap-2">
              <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
                <input type="file" accept=".md,.markdown,.txt" @change="handleFileUpload" class="hidden" />
                上传 Markdown
              </label>
              <button @click="downloadHtml" :disabled="!htmlOutput" class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">下载 HTML</button>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="font-medium text-lg">HTML 输出</h3>
          <div class="flex gap-2">
            <button @click="activeTab = 'preview'" :class="activeTab === 'preview' ? 'bg-blue-600' : 'bg-gray-600'" class="px-3 py-1 hover:bg-blue-700 text-white rounded text-sm">预览</button>
            <button @click="activeTab = 'code'" :class="activeTab === 'code' ? 'bg-blue-600' : 'bg-gray-600'" class="px-3 py-1 hover:bg-blue-700 text-white rounded text-sm">代码</button>
            <button @click="copyHtml" :disabled="!htmlOutput" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">复制</button>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div v-if="activeTab === 'preview'" class="p-4 min-h-96 max-h-96 overflow-y-auto">
            <div v-if="htmlOutput" v-html="htmlOutput" class="prose dark:prose-invert max-w-none"></div>
            <div v-else class="text-center py-12 text-gray-500">
              <div class="text-4xl mb-4">📝</div>
              <div class="text-lg mb-2">Markdown 预览</div>
              <div class="text-sm">输入 Markdown 内容后将显示预览</div>
            </div>
          </div>

          <div v-if="activeTab === 'code'" class="p-4">
            <textarea
              v-model="htmlOutput"
              readonly
              rows="20"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm bg-gray-50"
              placeholder="HTML 代码将显示在这里..."
            />
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">转换统计</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span>输入字符:</span>
              <span class="font-mono">{{ markdownInput.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>输出字符:</span>
              <span class="font-mono">{{ htmlOutput.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>输入行数:</span>
              <span class="font-mono">{{ markdownInput.split('\n').length }}</span>
            </div>
            <div class="flex justify-between">
              <span>压缩比:</span>
              <span class="font-mono">{{ compressionRatio }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">转换历史</h4>
        <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
      </div>
      <div class="p-4">
        <div v-if="conversionHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="(history, index) in conversionHistory.slice(0, 10)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div class="flex-1 min-w-0">
              <div class="truncate">{{ history.title || '未命名文档' }}</div>
              <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.inputLength }} → {{ history.outputLength }} 字符</div>
            </div>
            <div class="flex gap-1">
              <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500 text-sm">暂无转换历史</div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">Markdown 语法参考</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">基础语法</h4>
          <ul class="space-y-1 font-mono text-xs">
            <li># 标题 1</li>
            <li>## 标题 2</li>
            <li>**粗体**</li>
            <li>*斜体*</li>
            <li>`代码`</li>
            <li>[链接](url)</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">列表和引用</h4>
          <ul class="space-y-1 font-mono text-xs">
            <li>- 无序列表</li>
            <li>1. 有序列表</li>
            <li>> 引用</li>
            <li>---分割线</li>
            <li>![图片](url)</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">高级语法</h4>
          <ul class="space-y-1 font-mono text-xs">
            <li>```代码块```</li>
            <li>| 表格 | 语法 |</li>
            <li>~~删除线~~</li>
            <li>- [x] 任务列表</li>
            <li>:emoji:</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ConversionOptions {
  breaks: boolean
  linkify: boolean
  typographer: boolean
  html: boolean
  xhtmlOut: boolean
}

interface ConversionHistory {
  title: string
  markdown: string
  html: string
  timestamp: string
  inputLength: number
  outputLength: number
  options: ConversionOptions
}

const markdownInput = ref('')
const htmlOutput = ref('')
const activeTab = ref<'preview' | 'code'>('preview')
const conversionHistory = ref<ConversionHistory[]>([])

const options = ref<ConversionOptions>({
  breaks: true,
  linkify: true,
  typographer: true,
  html: false,
  xhtmlOut: false
})

const compressionRatio = computed(() => {
  if (markdownInput.value.length === 0) return 0
  return Math.round((htmlOutput.value.length / markdownInput.value.length) * 100)
})

// 简单的 Markdown 转 HTML 实现
function convertToHtml() {
  if (!markdownInput.value.trim()) {
    htmlOutput.value = ''
    return
  }

  let html = markdownInput.value

  // 转义 HTML 字符（如果不允许 HTML）
  if (!options.value.html) {
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  // 标题
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // 粗体和斜体
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 删除线
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')

  // 行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${language}>${code.trim()}</code></pre>`
  })

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // 自动链接
  if (options.value.linkify) {
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>')
  }

  // 引用
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

  // 分割线
  html = html.replace(/^---$/gm, '<hr>')

  // 无序列表
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // 有序列表
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')

  // 任务列表
  html = html.replace(/^- \[x\] (.*$)/gm, '<li><input type="checkbox" checked disabled> $1</li>')
  html = html.replace(/^- \[ \] (.*$)/gm, '<li><input type="checkbox" disabled> $1</li>')

  // 表格（简单实现）
  const tableRegex = /^\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm
  html = html.replace(tableRegex, (match, header, rows) => {
    const headerCells = header.split('|').map((cell: string) => `<th>${cell.trim()}</th>`).join('')
    const rowCells = rows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').map((cell: string) => `<td>${cell.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    }).join('')
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rowCells}</tbody></table>`
  })

  // 段落
  if (options.value.breaks) {
    html = html.replace(/\n/g, '<br>')
  } else {
    html = html.replace(/\n\n/g, '</p><p>')
    html = `<p>${html}</p>`
  }

  // 排版优化
  if (options.value.typographer) {
    html = html.replace(/\.\.\./g, '…')
    html = html.replace(/--/g, '—')
    html = html.replace(/"([^"]+)"/g, '"$1"')
    html = html.replace(/'([^']+)'/g, ''$1'')
  }

  // XHTML 输出
  if (options.value.xhtmlOut) {
    html = html.replace(/<br>/g, '<br />')
    html = html.replace(/<hr>/g, '<hr />')
    html = html.replace(/<img ([^>]+)>/g, '<img $1 />')
  }

  htmlOutput.value = html

  // 添加到历史记录
  addToHistory()
}

function addToHistory() {
  if (!markdownInput.value.trim() || !htmlOutput.value.trim()) return

  // 提取标题作为文档名
  const titleMatch = markdownInput.value.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : `文档 ${conversionHistory.value.length + 1}`

  const historyItem: ConversionHistory = {
    title,
    markdown: markdownInput.value,
    html: htmlOutput.value,
    timestamp: new Date().toLocaleString('zh-CN'),
    inputLength: markdownInput.value.length,
    outputLength: htmlOutput.value.length,
    options: { ...options.value }
  }

  conversionHistory.value.unshift(historyItem)
  conversionHistory.value = conversionHistory.value.slice(0, 50) // 限制历史记录数量
  saveHistory()
}

function loadFromHistory(history: ConversionHistory) {
  markdownInput.value = history.markdown
  options.value = { ...history.options }
  convertToHtml()
}

function clearHistory() {
  conversionHistory.value = []
  saveHistory()
}

function loadSample() {
  markdownInput.value = `# Markdown 示例文档

这是一个 **Markdown** 转 *HTML* 的示例文档。

## 基础语法

### 文本格式

- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`行内代码\`

### 列表

#### 无序列表
- 项目 1
- 项目 2
- 项目 3

#### 有序列表
1. 第一项
2. 第二项
3. 第三项

#### 任务列表
- [x] 已完成任务
- [ ] 未完成任务

### 链接和图片

[访问 GitHub](https://github.com)

![示例图片](https://via.placeholder.com/300x200)

### 引用

> 这是一个引用块。
> 可以包含多行内容。

### 代码块

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### 表格

| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |

### 分割线

---

这就是 Markdown 的基本语法示例！`

  convertToHtml()
}

function clearInput() {
  markdownInput.value = ''
  htmlOutput.value = ''
}

async function copyHtml() {
  if (!htmlOutput.value) return

  try {
    await navigator.clipboard.writeText(htmlOutput.value)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function downloadHtml() {
  if (!htmlOutput.value) return

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown 转换结果</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        h3 { font-size: 1.25em; }
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
        }
        blockquote {
            border-left: 4px solid #dfe2e5;
            margin: 0;
            padding: 0 16px;
            color: #6a737d;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
            text-align: left;
        }
        th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        hr {
            border: none;
            border-top: 1px solid #eaecef;
            margin: 24px 0;
        }
        ul, ol {
            padding-left: 30px;
        }
        li {
            margin: 4px 0;
        }
    </style>
</head>
<body>
${htmlOutput.value}
</body>
</html>`

  const blob = new Blob([fullHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'markdown-converted.html'
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
    markdownInput.value = content
    convertToHtml()
  }
  reader.readAsText(file)
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file.name.match(/\.(md|markdown|txt)$/i)) {
    alert('请上传 .md, .markdown 或 .txt 文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    markdownInput.value = content
    convertToHtml()
  }
  reader.readAsText(file)
}

function saveHistory() {
  try {
    localStorage.setItem('markdown-conversion-history', JSON.stringify(conversionHistory.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('markdown-conversion-history')
    if (saved) {
      conversionHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose h1 {
  @apply text-2xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-600;
}

.prose h2 {
  @apply text-xl font-bold mb-3 pb-2 border-b border-gray-200 dark:border-gray-600;
}

.prose h3 {
  @apply text-lg font-bold mb-2;
}

.prose p {
  @apply mb-4;
}

.prose ul,
.prose ol {
  @apply mb-4 pl-6;
}

.prose li {
  @apply mb-1;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-4;
}

.prose code {
  @apply bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4 overflow-x-auto;
}

.prose pre code {
  @apply bg-transparent p-0;
}

.prose table {
  @apply w-full border-collapse mb-4;
}

.prose th,
.prose td {
  @apply border border-gray-300 dark:border-gray-600 px-3 py-2 text-left;
}

.prose th {
  @apply bg-gray-100 dark:bg-gray-700 font-semibold;
}

.prose img {
  @apply max-w-full h-auto mb-4;
}

.prose hr {
  @apply border-0 border-t border-gray-300 dark:border-gray-600 my-6;
}

.prose a {
  @apply text-blue-600 dark:text-blue-400 hover:underline;
}

.prose del {
  @apply line-through;
}
</style>
