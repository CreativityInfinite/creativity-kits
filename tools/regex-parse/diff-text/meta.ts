import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'diff-text',
  name: '文本差异对比',
  description: '强大的文本差异对比工具，支持多种对比模式（行/单词/字符/句子）和显示方式（并排/统一/内联），提供详细的差异统计和补丁导出功能',
  category: 'regex-parse',
  tags: ['文本对比', '差异分析', 'Diff', '版本对比', '代码审查', '文档比较'],
  color: '#8b5cf6',
  icon: 'tabler:file-diff',
  i18nKey: 'tools.diff-text',
  entry: 'tools/regex-parse/diff-text/Component.vue'
};
export default meta;
