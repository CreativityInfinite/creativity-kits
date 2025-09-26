import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'currency-converter',
  name: '货币转换器',
  description: '货币转换器工具',
  category: 'math-unit',
  tags: ['math-unit', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:currency-usd',
  i18nKey: 'tools.currency-converter',
  entry: 'tools/math-unit/currency-converter/Component.vue',
}
export default meta