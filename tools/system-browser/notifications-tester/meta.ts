import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'notifications-tester',
  name: '通知测试器',
  description: '通知测试器工具',
  category: 'system-browser',
  tags: ['system-browser', '工具'],
  icon: 'mdi:bell',
  i18nKey: 'tools.notifications-tester',
  entry: 'tools/system-browser/notifications-tester/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta