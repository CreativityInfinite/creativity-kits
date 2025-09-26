import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'natural-date-parser',
  name: '自然语言日期解析',
  description: '自然语言日期解析工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:calendar-text',
  i18nKey: 'tools.natural-date-parser',
  entry: 'tools/time-date/natural-date-parser/Component.vue',
}
export default meta