import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'cookie-editor',
  name: 'Cookie 编辑器',
  description: 'Cookie 编辑器工具',
  category: 'system-browser',
  tags: ['system-browser', '工具'],
  icon: 'mdi:cookie',
  i18nKey: 'tools.cookie-editor',
  entry: 'tools/system-browser/cookie-editor/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta