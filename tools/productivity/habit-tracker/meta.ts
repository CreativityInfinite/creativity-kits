import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'habit-tracker',
  name: '习惯追踪器',
  description: '习惯追踪器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:check-circle',
  i18nKey: 'tools.habit-tracker',
  entry: 'tools/productivity/habit-tracker/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta