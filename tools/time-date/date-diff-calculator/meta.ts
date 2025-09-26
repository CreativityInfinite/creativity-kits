import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'date-diff-calculator',
  name: '日期差值计算器',
  description: '日期差值计算器工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:calendar-minus',
  i18nKey: 'tools.date-diff-calculator',
  entry: 'tools/time-date/date-diff-calculator/Component.vue',
}
export default meta