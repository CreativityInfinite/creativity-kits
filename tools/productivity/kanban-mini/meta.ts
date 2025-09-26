import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'kanban-mini',
  name: '迷你看板',
  description: '迷你看板工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:view-column',
  i18nKey: 'tools.kanban-mini',
  entry: 'tools/productivity/kanban-mini/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta