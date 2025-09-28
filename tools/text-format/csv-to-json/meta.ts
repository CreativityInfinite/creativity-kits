import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'csv-to-json',
  name: 'CSV ⇄ JSON 转换工具',
  description: '强大的CSV与JSON互转工具，支持自定义分隔符、自动类型检测、表格预览和详细的数据分析，完美处理各种格式的结构化数据',
  category: 'text-format',
  tags: ['CSV', 'JSON', '数据转换', '表格数据', '结构化数据', '数据分析'],
  i18nKey: 'tools.csv-to-json',
  entry: 'tools/text-format/csv-to-json/Component.vue'
};
export default meta;
