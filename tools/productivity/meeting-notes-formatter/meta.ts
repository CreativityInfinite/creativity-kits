import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'meeting-notes-formatter',
  name: '会议记录格式化器',
  description: '会议记录格式化器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:note-text-outline',
  i18nKey: 'tools.meeting-notes-formatter',
  entry: 'tools/productivity/meeting-notes-formatter/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta