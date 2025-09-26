/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const root = path.resolve(process.cwd(), 'FancyTools/tools')

// 依据需求清单，期望的分类->工具ID列表
const wanted = {
  'text-format': [
    'markdown-to-html',
    'html-to-markdown',
    'base64-encode',
    'base64-decode',
    'url-encode',
    'url-decode',
    'json-pretty',
    'json-minify',
    'yaml-to-json',
    'json-to-yaml',
    'csv-to-json',
    'text-case-converter'
  ],
  'regex-parse': ['regex-tester', 'glob-tester', 'diff-text', 'slug-generator', 'uuid-generator', 'lorem-ipsum-generator', 'credit-card-validator', 'iban-validator'],
  'time-date': [
    'timestamp-converter',
    'date-diff-calculator',
    'cron-expression-validator',
    'cron-next-run',
    'timezone-converter',
    'working-days-calculator',
    'age-calculator',
    'countdown-timer',
    'ics-calendar-generator',
    'natural-date-parser'
  ],
  'color-graphics': [
    'color-picker',
    'color-format-converter',
    'palette-generator',
    'gradient-generator',
    'contrast-checker',
    'color-blindness-simulator',
    'favicon-generator',
    'svg-optimizer',
    'svg-to-png',
    'ascii-art-generator'
  ],
  'image-media': [
    'image-resizer',
    'image-compressor',
    'exif-viewer',
    'meme-generator',
    'sprite-sheet-generator',
    'image-watermark',
    'audio-trimmer',
    'audio-format-converter',
    'video-gif-converter',
    'webcam-capture-tool'
  ],
  'dev-network': [
    'http-requester',
    'websocket-client',
    'jwt-decoder',
    'jwt-signer',
    'oauth-pkce-helper',
    'dns-lookup',
    'ip-geo-lookup',
    'user-agent-parser',
    'macaddress-vendor-lookup',
    'mime-type-finder',
    'url-parser',
    'qr-code-generator'
  ],
  'data-file': [
    'csv-merge-split',
    'tsv-converter',
    'json-schema-validator',
    'json-diff-viewer',
    'excel-to-csv',
    'pdf-merger',
    'pdf-splitter',
    'file-hash-calculator',
    'zip-unzip',
    'text-encoding-converter'
  ],
  'security-privacy': [
    'password-generator',
    'password-strength-checker',
    'twofa-totp-generator',
    'rsa-keypair-generator',
    'aes-encrypt-decrypt',
    'hash-generator',
    'secure-note',
    'image-metadata-sanitizer'
  ],
  'math-unit': [
    'unit-converter',
    'currency-converter',
    'fraction-decimal-converter',
    'matrix-calculator',
    'equation-solver',
    'statistics-tool',
    'combinatorics-calculator',
    'prime-tester-and-generator',
    'big-number-calculator',
    'mortgage-loan-calculator'
  ],
  productivity: [
    'kanban-mini',
    'pomodoro-timer',
    'habit-tracker',
    'markdown-editor',
    'mindmap-editor',
    'table-editor',
    'resume-builder',
    'meeting-notes-formatter',
    'email-template-builder',
    'calendar-heatmap-generator'
  ],
  'social-marketing': ['utm-builder', 'open-graph-image-generator', 'social-post-scheduler', 'hashtag-generator', 'keyword-density-analyzer', 'sitemap-generator'],
  'education-language': ['phonetic-transcriber', 'pinyin-converter', 'text-readability-analyzer', 'flashcard-generator', 'typing-practice', 'quiz-maker'],
  'map-geo': ['geojson-viewer-editor', 'coordinates-converter', 'distance-calculator', 'elevation-profiler', 'map-snapshot-generator'],
  'system-browser': ['clipboard-manager', 'file-drop-inspector', 'notifications-tester', 'service-worker-tester', 'localstorage-inspector', 'cookie-editor', 'performance-profiler']
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function writeIfMissing(p, content) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, content, 'utf8')
}

function metaContent(category, id) {
  return `import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: '${id}',
  name: '${id}',
  description: '${id} 工具',
  category: '${category}',
  i18nKey: 'tools.${id}',
  entry: 'tools/${category}/${id}/Component.vue'
}
export default meta
`
}

function componentContent(id) {
  return `<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">${id}</h1>
    <p class="text-gray-500">占位组件，待实现功能。</p>
  </div>
</template>
<script setup lang="ts">
// TODO: 实现 ${id}
</script>
`
}

function main() {
  let created = 0
  Object.entries(wanted).forEach(([category, ids]) => {
    const catDir = path.join(root, category)
    ensureDir(catDir)
    ids.forEach((id) => {
      const toolDir = path.join(catDir, id)
      ensureDir(toolDir)
      const metaPath = path.join(toolDir, 'meta.ts')
      const compPath = path.join(toolDir, 'Component.vue')
      if (!fs.existsSync(metaPath)) {
        fs.writeFileSync(metaPath, metaContent(category, id), 'utf8')
        created++
        console.log('[created meta]', path.relative(process.cwd(), metaPath))
      }
      writeIfMissing(compPath, componentContent(id))
    })
  })
  console.log('ensure-tools done. created meta:', created)
}
main()
