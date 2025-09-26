import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'mindmap-editor',
  name: '思维导图编辑器',
  description: '思维导图编辑器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:graph',
  i18nKey: 'tools.mindmap-editor',
  entry: 'tools/productivity/mindmap-editor/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta