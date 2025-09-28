import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'mortgage-loan-calculator',
  name: '房贷计算器',
  description: '房贷计算器工具',
  category: 'math-unit',
  tags: ['math-unit', '工具'],
  icon: 'mdi:home-currency-usd',
  i18nKey: 'tools.mortgage-loan-calculator',
  entry: 'tools/math-unit/mortgage-loan-calculator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
