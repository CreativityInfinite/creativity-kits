import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'localstorage-inspector',
  name: 'LocalStorage 检查器',
  description: 'LocalStorage 检查器工具',
  category: 'system-browser',
  tags: ['system-browser', '工具'],
  icon: 'mdi:database',
  i18nKey: 'tools.localstorage-inspector',
  entry: 'tools/system-browser/localstorage-inspector/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta