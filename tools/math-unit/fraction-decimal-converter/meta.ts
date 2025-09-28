import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'fraction-decimal-converter',
  name: '分数小数转换器',
  description: '分数与小数之间的双向转换，支持循环小数和批量处理',
  category: 'math-unit',
  tags: ['分数', '小数', '数学转换', '循环小数', '批量转换'],
  i18nKey: 'tools.fraction-decimal-converter',
  entry: 'tools/math-unit/fraction-decimal-converter/Component.vue'
};
export default meta;
