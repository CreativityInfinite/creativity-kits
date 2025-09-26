import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'working-days-calculator',
  name: '工作日计算器',
  description: '工作日计算器工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:briefcase-clock',
  i18nKey: 'tools.working-days-calculator',
  entry: 'tools/time-date/working-days-calculator/Component.vue',
}
export default meta