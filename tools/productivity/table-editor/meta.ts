import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'table-editor',
  name: '表格编辑器',
  description: '表格编辑器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:table-edit',
  i18nKey: 'tools.table-editor',
  entry: 'tools/productivity/table-editor/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta