import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'unit-converter',
  name: '单位换算',
  description: '长度/温度等',
  category: 'math-unit',
  tags: ['unit'],
  i18nKey: 'tools.unit-converter',
  color: 'linear-gradient(135deg,#84cc16,#22d3ee)',
  icon: 'tabler:calculator',
  entry: 'tools/math-unit/unit-converter/Component.vue'
}
export default meta
