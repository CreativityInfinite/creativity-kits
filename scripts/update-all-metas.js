#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 所有工具的定义（与生成脚本保持一致）
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
    id: 'dev-network',
    name: '开发与网络',
    tools: [{ id: 'qr-code-generator', name: '二维码生成器', icon: 'mdi:qrcode' }]
  },
  {
    id: 'math-unit',
    name: '数学与单位',
    tools: [{ id: 'currency-converter', name: '货币转换器', icon: 'mdi:currency-usd' }]
  },
  {
    id: 'productivity',
    name: '生产力与办公',
    tools: [{ id: 'pomodoro-timer', name: '番茄钟', icon: 'mdi:timer' }]
  }
];

function generateMetaContent(toolId, toolName, categoryId, icon) {
  return `import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: '${toolId}',
  name: '${toolName}',
  description: '${toolName}工具',
  category: '${categoryId}',
  tags: ['${categoryId}', '工具'],
  i18nKey: 'tools.${toolId}',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: '${icon}',
  entry: 'tools/${categoryId}/${toolId}/Component.vue'
}

export default meta
`;
}

async function updateMeta(categoryId, toolId, toolName, icon) {
  const metaPath = path.join(__dirname, '..', 'tools', categoryId, toolId, 'meta.ts');

  try {
    const metaContent = generateMetaContent(toolId, toolName, categoryId, icon);
    await fs.writeFile(metaPath, metaContent);
    console.log(`更新 meta: ${categoryId}/${toolId}`);
  } catch (error) {
    console.error(`更新 meta 失败 ${categoryId}/${toolId}:`, error);
  }
}

async function main() {
  console.log('开始更新所有工具的 meta 文件...');

  for (const category of toolCategories) {
    console.log(`\n处理分类: ${category.name}`);

    for (const tool of category.tools) {
      await updateMeta(category.id, tool.id, tool.name, tool.icon);
    }
  }

  console.log('\n所有 meta 文件更新完成！');
}

main().catch(console.error);
