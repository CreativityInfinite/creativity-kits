import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'ics-calendar-generator',
  name: 'ICS 日历生成器',
  description: 'ICS 日历生成器工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:calendar-export',
  i18nKey: 'tools.ics-calendar-generator',
  entry: 'tools/time-date/ics-calendar-generator/Component.vue',
}
export default meta