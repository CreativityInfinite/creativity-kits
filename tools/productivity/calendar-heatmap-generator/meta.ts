import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'calendar-heatmap-generator',
  name: '日历热力图生成器',
  description: '日历热力图生成器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:calendar-heart',
  i18nKey: 'tools.calendar-heatmap-generator',
  entry: 'tools/productivity/calendar-heatmap-generator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta