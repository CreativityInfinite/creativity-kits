#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 所有工具的定义
const toolCategories = [
  {
    id: 'text-format',
    name: '文本与格式化',
    tools: [
      { id: 'html-to-markdown', name: 'HTML 转 Markdown', icon: 'mdi:language-html5' },
      { id: 'base64-decode', name: 'Base64 解码', icon: 'mdi:code-tags-check' },
      { id: 'url-encode', name: 'URL 编码', icon: 'mdi:link-variant' },
      { id: 'url-decode', name: 'URL 解码', icon: 'mdi:link-variant-off' },
      { id: 'json-minify', name: 'JSON 压缩', icon: 'mdi:compress' },
      { id: 'yaml-to-json', name: 'YAML 转 JSON', icon: 'mdi:swap-horizontal' },
      { id: 'json-to-yaml', name: 'JSON 转 YAML', icon: 'mdi:swap-horizontal-variant' },
      { id: 'csv-to-json', name: 'CSV 转 JSON', icon: 'mdi:table-arrow-right' },
      { id: 'text-case-converter', name: '文本大小写转换', icon: 'mdi:format-letter-case' }
    ]
  },
  {
    id: 'regex-parse',
    name: '正则与解析',
    tools: [
      { id: 'glob-tester', name: 'Glob 模式测试器', icon: 'mdi:file-search' },
      { id: 'diff-text', name: '文本差异对比', icon: 'mdi:compare' },
      { id: 'slug-generator', name: 'Slug 生成器', icon: 'mdi:link' },
      { id: 'uuid-generator', name: 'UUID 生成器', icon: 'mdi:identifier' },
      { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum 生成器', icon: 'mdi:text' },
      { id: 'credit-card-validator', name: '信用卡号验证器', icon: 'mdi:credit-card' },
      { id: 'iban-validator', name: 'IBAN 验证器', icon: 'mdi:bank' }
    ]
  },
  {
    id: 'time-date',
    name: '时间与日期',
    tools: [
      { id: 'date-diff-calculator', name: '日期差值计算器', icon: 'mdi:calendar-minus' },
      { id: 'cron-expression-validator', name: 'Cron 表达式验证器', icon: 'mdi:timer-cog' },
      { id: 'cron-next-run', name: 'Cron 下次执行时间', icon: 'mdi:timer-play' },
      { id: 'timezone-converter', name: '时区转换器', icon: 'mdi:earth' },
      { id: 'working-days-calculator', name: '工作日计算器', icon: 'mdi:briefcase-clock' },
      { id: 'age-calculator', name: '年龄计算器', icon: 'mdi:cake-variant' },
      { id: 'countdown-timer', name: '倒计时器', icon: 'mdi:timer' },
      { id: 'ics-calendar-generator', name: 'ICS 日历生成器', icon: 'mdi:calendar-export' },
      { id: 'natural-date-parser', name: '自然语言日期解析', icon: 'mdi:calendar-text' }
    ]
  },
  {
    id: 'color-graphics',
    name: '颜色与图形',
    tools: [
      { id: 'color-picker', name: '颜色选择器', icon: 'mdi:eyedropper' },
      { id: 'palette-generator', name: '调色板生成器', icon: 'mdi:palette-advanced' },
      { id: 'gradient-generator', name: '渐变生成器', icon: 'mdi:gradient-horizontal' },
      { id: 'contrast-checker', name: '对比度检查器', icon: 'mdi:contrast-circle' },
      { id: 'color-blindness-simulator', name: '色盲模拟器', icon: 'mdi:eye-off' },
      { id: 'favicon-generator', name: 'Favicon 生成器', icon: 'mdi:web' },
      { id: 'svg-optimizer', name: 'SVG 优化器', icon: 'mdi:vector-arrange-above' },
      { id: 'svg-to-png', name: 'SVG 转 PNG', icon: 'mdi:image-convert' },
      { id: 'ascii-art-generator', name: 'ASCII 艺术生成器', icon: 'mdi:format-text-variant' }
    ]
  },
  {
    id: 'image-media',
    name: '图片/多媒体',
    tools: [
      { id: 'image-compressor', name: '图片压缩器', icon: 'mdi:compress' },
      { id: 'exif-viewer', name: 'EXIF 信息查看器', icon: 'mdi:information' },
      { id: 'meme-generator', name: '表情包生成器', icon: 'mdi:emoticon' },
      { id: 'sprite-sheet-generator', name: '精灵图生成器', icon: 'mdi:grid' },
      { id: 'image-watermark', name: '图片水印工具', icon: 'mdi:watermark' },
      { id: 'audio-trimmer', name: '音频裁剪器', icon: 'mdi:content-cut' },
      { id: 'audio-format-converter', name: '音频格式转换器', icon: 'mdi:music-circle' },
      { id: 'video-gif-converter', name: '视频转 GIF', icon: 'mdi:gif' },
      { id: 'webcam-capture-tool', name: '摄像头拍照工具', icon: 'mdi:camera' }
    ]
  },
  {
    id: 'dev-network',
    name: '开发与网络',
    tools: [
      { id: 'http-requester', name: 'HTTP 请求工具', icon: 'mdi:web' },
      { id: 'websocket-client', name: 'WebSocket 客户端', icon: 'mdi:lan-connect' },
      { id: 'jwt-signer', name: 'JWT 签名器', icon: 'mdi:key-plus' },
      { id: 'oauth-pkce-helper', name: 'OAuth PKCE 助手', icon: 'mdi:shield-key' },
      { id: 'dns-lookup', name: 'DNS 查询工具', icon: 'mdi:dns' },
      { id: 'ip-geo-lookup', name: 'IP 地理位置查询', icon: 'mdi:map-marker' },
      { id: 'user-agent-parser', name: 'User Agent 解析器', icon: 'mdi:information-outline' },
      { id: 'macaddress-vendor-lookup', name: 'MAC 地址厂商查询', icon: 'mdi:ethernet' },
      { id: 'mime-type-finder', name: 'MIME 类型查询', icon: 'mdi:file-question' },
      { id: 'url-parser', name: 'URL 解析器', icon: 'mdi:link-variant' },
      { id: 'qr-code-generator', name: '二维码生成器', icon: 'mdi:qrcode' }
    ]
  },
  {
    id: 'data-file',
    name: '数据与文件',
    tools: [
      { id: 'csv-merge-split', name: 'CSV 合并分割', icon: 'mdi:table-split-cell' },
      { id: 'tsv-converter', name: 'TSV 转换器', icon: 'mdi:table-arrow-right' },
      { id: 'json-schema-validator', name: 'JSON Schema 验证器', icon: 'mdi:check-circle' },
      { id: 'json-diff-viewer', name: 'JSON 差异查看器', icon: 'mdi:compare-horizontal' },
      { id: 'excel-to-csv', name: 'Excel 转 CSV', icon: 'mdi:microsoft-excel' },
      { id: 'pdf-merger', name: 'PDF 合并器', icon: 'mdi:file-pdf-box' },
      { id: 'pdf-splitter', name: 'PDF 分割器', icon: 'mdi:content-cut' },
      { id: 'file-hash-calculator', name: '文件哈希计算器', icon: 'mdi:pound' },
      { id: 'zip-unzip', name: 'ZIP 压缩解压', icon: 'mdi:zip-box' },
      { id: 'text-encoding-converter', name: '文本编码转换器', icon: 'mdi:format-text' }
    ]
  },
  {
    id: 'security-privacy',
    name: '安全与隐私',
    tools: [
      { id: 'password-strength-checker', name: '密码强度检查器', icon: 'mdi:shield-check' },
      { id: 'twofa-totp-generator', name: '2FA TOTP 生成器', icon: 'mdi:two-factor-authentication' },
      { id: 'rsa-keypair-generator', name: 'RSA 密钥对生成器', icon: 'mdi:key-chain' },
      { id: 'aes-encrypt-decrypt', name: 'AES 加密解密', icon: 'mdi:lock' },
      { id: 'hash-generator', name: '哈希生成器', icon: 'mdi:pound-box' },
      { id: 'secure-note', name: '安全笔记', icon: 'mdi:note-text' },
      { id: 'image-metadata-sanitizer', name: '图片元数据清理器', icon: 'mdi:image-remove' }
    ]
  },
  {
    id: 'math-unit',
    name: '数学与单位',
    tools: [
      { id: 'currency-converter', name: '货币转换器', icon: 'mdi:currency-usd' },
      { id: 'fraction-decimal-converter', name: '分数小数转换器', icon: 'mdi:division' },
      { id: 'matrix-calculator', name: '矩阵计算器', icon: 'mdi:matrix' },
      { id: 'equation-solver', name: '方程求解器', icon: 'mdi:function-variant' },
      { id: 'statistics-tool', name: '统计工具', icon: 'mdi:chart-line' },
      { id: 'combinatorics-calculator', name: '排列组合计算器', icon: 'mdi:shuffle-variant' },
      { id: 'prime-tester-and-generator', name: '质数测试生成器', icon: 'mdi:numeric' },
      { id: 'big-number-calculator', name: '大数计算器', icon: 'mdi:calculator-variant' },
      { id: 'mortgage-loan-calculator', name: '房贷计算器', icon: 'mdi:home-currency-usd' }
    ]
  },
  {
    id: 'productivity',
    name: '生产力与办公',
    tools: [
      { id: 'kanban-mini', name: '迷你看板', icon: 'mdi:view-column' },
      { id: 'habit-tracker', name: '习惯追踪器', icon: 'mdi:check-circle' },
      { id: 'markdown-editor', name: 'Markdown 编辑器', icon: 'mdi:language-markdown-outline' },
      { id: 'mindmap-editor', name: '思维导图编辑器', icon: 'mdi:graph' },
      { id: 'table-editor', name: '表格编辑器', icon: 'mdi:table-edit' },
      { id: 'resume-builder', name: '简历生成器', icon: 'mdi:account-box' },
      { id: 'meeting-notes-formatter', name: '会议记录格式化器', icon: 'mdi:note-text-outline' },
      { id: 'email-template-builder', name: '邮件模板构建器', icon: 'mdi:email-edit' },
      { id: 'calendar-heatmap-generator', name: '日历热力图生成器', icon: 'mdi:calendar-heart' }
    ]
  },
  {
    id: 'social-marketing',
    name: '社媒与营销',
    tools: [
      { id: 'open-graph-image-generator', name: 'Open Graph 图片生成器', icon: 'mdi:image-frame' },
      { id: 'social-post-scheduler', name: '社交媒体发布计划器', icon: 'mdi:calendar-clock' },
      { id: 'hashtag-generator', name: '标签生成器', icon: 'mdi:pound' },
      { id: 'keyword-density-analyzer', name: '关键词密度分析器', icon: 'mdi:text-search' },
      { id: 'sitemap-generator', name: '网站地图生成器', icon: 'mdi:sitemap' }
    ]
  },
  {
    id: 'education-language',
    name: '教育与语言',
    tools: [
      { id: 'phonetic-transcriber', name: '音标转换器', icon: 'mdi:phonetic' },
      { id: 'pinyin-converter', name: '拼音转换器', icon: 'mdi:translate' },
      { id: 'text-readability-analyzer', name: '文本可读性分析器', icon: 'mdi:text-recognition' },
      { id: 'flashcard-generator', name: '记忆卡片生成器', icon: 'mdi:cards' },
      { id: 'quiz-maker', name: '测验制作器', icon: 'mdi:help-circle' }
    ]
  },
  {
    id: 'map-geo',
    name: '地图与地理',
    tools: [
      { id: 'geojson-viewer-editor', name: 'GeoJSON 查看编辑器', icon: 'mdi:map-marker-path' },
      { id: 'coordinates-converter', name: '坐标转换器', icon: 'mdi:crosshairs-gps' },
      { id: 'elevation-profiler', name: '海拔剖面图', icon: 'mdi:chart-areaspline' },
      { id: 'map-snapshot-generator', name: '地图快照生成器', icon: 'mdi:camera-image' }
    ]
  },
  {
    id: 'system-browser',
    name: '系统与浏览器',
    tools: [
      { id: 'file-drop-inspector', name: '文件拖拽检查器', icon: 'mdi:file-search' },
      { id: 'notifications-tester', name: '通知测试器', icon: 'mdi:bell' },
      { id: 'service-worker-tester', name: 'Service Worker 测试器', icon: 'mdi:worker' },
      { id: 'localstorage-inspector', name: 'LocalStorage 检查器', icon: 'mdi:database' },
      { id: 'cookie-editor', name: 'Cookie 编辑器', icon: 'mdi:cookie' },
      { id: 'performance-profiler', name: '性能分析器', icon: 'mdi:speedometer' }
    ]
  }
]

// 生成工具的基础模板
function generateComponentTemplate(toolId, toolName, categoryId) {
  return `<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        ${toolName}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        ${toolName}工具，功能待实现
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输入
          </label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入内容..."
          />
        </div>

        <div class="flex justify-center">
          <button
            @click="process"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            处理
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输出
          </label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            placeholder="处理结果将显示在这里..."
          />
        </div>

        <div class="flex justify-center">
          <button
            @click="copyToClipboard"
            :disabled="!output"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            复制结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const output = ref('')

function process() {
  // TODO: 实现具体的处理逻辑
  output.value = \`处理结果: \${input.value}\`
}

async function copyToClipboard() {
  if (!output.value) return
  
  try {
    await navigator.clipboard.writeText(output.value)
    // TODO: 添加成功提示
  } catch (err) {
    console.error('复制失败:', err)
    // TODO: 添加错误提示
  }
}
</script>
`
}

function generateMetaTemplate(toolId, toolName, categoryId, icon) {
  return `import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  name: '${toolName}',
  description: '${toolName}工具',
  category: '${categoryId}',
  icon: '${icon}',
  tags: ['${categoryId}', '工具'],
  isNew: true,
  isPopular: false
}

export default meta
`
}

async function createTool(categoryId, toolId, toolName, icon) {
  const toolDir = path.join(__dirname, '..', 'tools', categoryId, toolId)

  try {
    await fs.mkdir(toolDir, { recursive: true })

    // 检查文件是否已存在
    const componentPath = path.join(toolDir, 'Component.vue')
    const metaPath = path.join(toolDir, 'meta.ts')

    try {
      await fs.access(componentPath)
      console.log(`跳过已存在的工具: ${categoryId}/${toolId}`)
      return
    } catch {
      // 文件不存在，继续创建
    }

    const componentContent = generateComponentTemplate(toolId, toolName, categoryId)
    const metaContent = generateMetaTemplate(toolId, toolName, categoryId, icon)

    await fs.writeFile(componentPath, componentContent)
    await fs.writeFile(metaPath, metaContent)

    console.log(`创建工具: ${categoryId}/${toolId}`)
  } catch (error) {
    console.error(`创建工具失败 ${categoryId}/${toolId}:`, error)
  }
}

async function main() {
  console.log('开始生成所有工具...')

  for (const category of toolCategories) {
    console.log(`\n处理分类: ${category.name}`)

    for (const tool of category.tools) {
      await createTool(category.id, tool.id, tool.name, tool.icon)
    }
  }

  console.log('\n所有工具生成完成！')
}

main().catch(console.error)
