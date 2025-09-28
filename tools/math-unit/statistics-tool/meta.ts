import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'statistics-tool',
  name: '统计计算器',
  description: '全面的统计分析工具，计算均值、方差、标准差、分位数、置信区间等统计量',
  category: 'math-unit',
  tags: ['统计', '数据分析', '均值', '方差', '标准差', '分位数', '置信区间'],
  i18nKey: 'tools.statistics-tool',
  entry: 'tools/math-unit/statistics-tool/Component.vue'
};
export default meta;
