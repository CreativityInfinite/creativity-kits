import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'matrix-calculator',
  name: 'matrix-calculator',
  description: '支持矩阵加减乘运算和行列式计算的数学工具',
  category: 'math-unit',
  tags: ['数学', '矩阵', '线性代数', '计算器', '行列式'],
  i18nKey: 'tools.matrix-calculator',
  entry: 'tools/math-unit/matrix-calculator/Component.vue',
}
export default meta