#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toolsDir = path.join(__dirname, '../tools');
const categories = fs.readdirSync(toolsDir);

let totalTools = 0;
let issues = [];

console.log('🔍 验证所有工具...\n');

categories.forEach((category) => {
  const categoryPath = path.join(toolsDir, category);
  if (!fs.statSync(categoryPath).isDirectory()) return;

  const tools = fs.readdirSync(categoryPath);
  console.log(`📁 ${category}: ${tools.length} 个工具`);

  tools.forEach((tool) => {
    const toolPath = path.join(categoryPath, tool);
    if (!fs.statSync(toolPath).isDirectory()) return;

    totalTools++;

    // 检查必需文件
    const metaPath = path.join(toolPath, 'meta.ts');
    const componentPath = path.join(toolPath, 'Component.vue');

    if (!fs.existsSync(metaPath)) {
      issues.push(`❌ ${category}/${tool}: 缺少 meta.ts`);
    }

    if (!fs.existsSync(componentPath)) {
      issues.push(`❌ ${category}/${tool}: 缺少 Component.vue`);
    }

    // 检查 meta.ts 格式
    if (fs.existsSync(metaPath)) {
      const metaContent = fs.readFileSync(metaPath, 'utf8');
      if (metaContent.includes("from '~/types'")) {
        issues.push(`⚠️  ${category}/${tool}: 导入路径需要修复`);
      }
    }
  });
});

console.log(`\n📊 总计: ${totalTools} 个工具`);

if (issues.length > 0) {
  console.log(`\n🚨 发现 ${issues.length} 个问题:`);
  issues.forEach((issue) => console.log(issue));
} else {
  console.log('\n✅ 所有工具验证通过！');
}
