import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'equation-solver',
  name: '方程求解器',
  description: '方程求解器工具',
  category: 'math-unit',
  tags: ['math-unit', '工具'],
  icon: 'mdi:function-variant',
  i18nKey: 'tools.equation-solver',
  entry: 'tools/math-unit/equation-solver/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta