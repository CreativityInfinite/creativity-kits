import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'age-calculator',
  name: '年龄计算器',
  description: '年龄计算器工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:cake-variant',
  i18nKey: 'tools.age-calculator',
  entry: 'tools/time-date/age-calculator/Component.vue',
}
export default meta