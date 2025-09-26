import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'social-post-scheduler',
  name: '社交媒体发布计划器',
  description: '社交媒体发布计划器工具',
  category: 'social-marketing',
  tags: ['social-marketing', '工具'],
  icon: 'mdi:calendar-clock',
  i18nKey: 'tools.social-post-scheduler',
  entry: 'tools/social-marketing/social-post-scheduler/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta