import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'big-number-calculator',
  name: '大数计算器',
  description: '大数计算器工具',
  category: 'math-unit',
  tags: ['math-unit', '工具'],
  icon: 'mdi:calculator-variant',
  i18nKey: 'tools.big-number-calculator',
  entry: 'tools/math-unit/big-number-calculator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta