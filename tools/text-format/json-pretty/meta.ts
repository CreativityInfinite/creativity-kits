import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'json-pretty',
  name: 'JSON 美化工具',
  description: '专业的JSON格式化和压缩工具，支持语法高亮、数据分析、扁平化处理和空值清理，提供完整的JSON处理解决方案',
  category: 'text-format',
  tags: ['JSON', '格式化', '美化', '压缩', '语法高亮', '数据分析'],
  i18nKey: 'tools.json-pretty',
  entry: 'tools/text-format/json-pretty/Component.vue'
};
export default meta;
