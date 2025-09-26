import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'secure-note',
  name: '安全笔记',
  description: '安全笔记工具',
  category: 'security-privacy',
  tags: ['security-privacy', '工具'],
  icon: 'mdi:note-text',
  i18nKey: 'tools.secure-note',
  entry: 'tools/security-privacy/secure-note/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta