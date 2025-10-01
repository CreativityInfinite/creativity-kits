import fs from 'fs';
import path from 'path';

// 递归查找所有meta.ts文件
function findMetaFiles(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results.push(...findMetaFiles(filePath));
    } else if (file === 'meta.ts') {
      results.push(filePath);
    }
  }
  
  return results;
}

// 修正tags字段格式
function fixTagsFormat(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 匹配数组格式的tags字段：tags: ['category', 'tools.id.tags']
    const arrayTagsRegex = /tags:\s*\[\s*'([^']+)',\s*'tools\.([^']+)\.tags'\s*\]/;
    const match = content.match(arrayTagsRegex);
    
    if (match) {
      const [, category, toolId] = match;
      // 替换为单个字符串格式：tags: 'tools.id.tags'
      const newContent = content.replace(arrayTagsRegex, `tags: 'tools.${toolId}.tags'`);
      fs.writeFileSync(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  const toolsDir = './tools';
  const metaFiles = findMetaFiles(toolsDir);
  
  console.log(`找到 ${metaFiles.length} 个meta.ts文件`);
  
  let fixedCount = 0;
  for (const filePath of metaFiles) {
    if (fixTagsFormat(filePath)) {
      console.log(`✓ 修正 ${path.basename(path.dirname(filePath))} 的tags格式`);
      fixedCount++;
    }
  }
  
  console.log(`\n完成！共修正了 ${fixedCount} 个文件的tags格式`);
}

main().catch(console.error);