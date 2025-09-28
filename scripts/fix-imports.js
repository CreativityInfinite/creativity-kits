#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toolsDir = path.join(__dirname, '../tools');

console.log('🔧 开始修复导入路径...\n');

function fixImportsInDirectory(dir) {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      fixImportsInDirectory(itemPath);
    } else if (item === 'meta.ts') {
      let content = fs.readFileSync(itemPath, 'utf8');

      if (content.includes("from '~/types'")) {
        content = content.replace("from '~/types'", "from '~/types/tool'");
        fs.writeFileSync(itemPath, content);
        console.log(`✅ 修复: ${path.relative(toolsDir, itemPath)}`);
      }
    }
  });
}

fixImportsInDirectory(toolsDir);
console.log('\n🎉 修复完成！');
