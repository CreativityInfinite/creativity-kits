import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'combinatorics-calculator',
  name: '排列组合计算器',
  description: '排列组合计算器工具',
  category: 'math-unit',
  tags: ['math-unit', '工具'],
  icon: 'mdi:shuffle-variant',
  i18nKey: 'tools.combinatorics-calculator',
  entry: 'tools/math-unit/combinatorics-calculator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta