const fs = require('fs');
const path = require('path');

// 读取zh-CN.json文件
const zhCNPath = path.join(__dirname, 'i18n/locales/zh-CN.json');
const zhCNContent = fs.readFileSync(zhCNPath, 'utf8');
const zhCNData = JSON.parse(zhCNContent);

// 获取所有工具的tags配置
const toolTags = zhCNData.tools;

// 搜索所有meta.ts文件
const toolsDir = path.join(__dirname, 'tools');
const metaFiles = [];

function findMetaFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findMetaFiles(filePath);
    } else if (file === 'meta.ts') {
      metaFiles.push(filePath);
    }
  }
}

findMetaFiles(toolsDir);

console.log(`找到 ${metaFiles.length} 个meta.ts文件`);

// 处理每个meta.ts文件
for (const metaFile of metaFiles) {
  try {
    const content = fs.readFileSync(metaFile, 'utf8');
    
    // 提取工具ID
    const idMatch = content.match(/id:\s*'([^']+)'/);
    if (!idMatch) continue;
    
    const toolId = idMatch[1];
    
    // 检查zh-CN.json中是否有对应的tags配置
    if (toolTags[toolId] && toolTags[toolId].tags) {
      const newTags = toolTags[toolId].tags;
      
      // 构建新的tags数组，保留类别标签，替换详细标签
      const categoryMatch = content.match(/category:\s*'([^']+)'/);
      const category = categoryMatch ? categoryMatch[1] : '';
      
      const newTagsArray = [category, ...newTags];
      const newTagsString = `tags: [${newTagsArray.map(tag => `'${tag}'`).join(', ')}]`;
      
      // 替换tags字段
      const updatedContent = content.replace(/tags:\s*\[[^\]]*\]/, newTagsString);
      
      // 写入文件
      fs.writeFileSync(metaFile, updatedContent, 'utf8');
      console.log(`✓ 更新 ${toolId} 的tags配置`);
    } else {
      console.log(`- ${toolId} 在zh-CN.json中无tags配置`);
    }
  } catch (error) {
    console.error(`✗ 处理 ${metaFile} 时出错:`, error.message);
  }
}

console.log('所有meta.ts文件tags配置更新完成！');