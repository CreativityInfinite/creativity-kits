import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'json-diff-viewer',
  name: 'JSON 差异对比',
  description: '深度对比两个JSON对象的差异，支持嵌套结构和详细报告导出',
  category: 'data-file',
  tags: ['JSON', '差异', '对比', 'diff', '数据分析'],
  i18nKey: 'tools.json-diff-viewer',
  entry: 'tools/data-file/json-diff-viewer/Component.vue'
};
export default meta;
