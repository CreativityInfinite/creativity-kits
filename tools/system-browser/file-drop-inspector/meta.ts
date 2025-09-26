import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'file-drop-inspector',
  name: '文件拖拽检查器',
  description: '文件拖拽检查器工具',
  category: 'system-browser',
  tags: ['system-browser', '工具'],
  icon: 'mdi:file-search',
  i18nKey: 'tools.file-drop-inspector',
  entry: 'tools/system-browser/file-drop-inspector/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta