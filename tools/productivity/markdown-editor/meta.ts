import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'markdown-editor',
  name: 'Markdown 编辑器',
  description: 'Markdown 编辑器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:language-markdown-outline',
  i18nKey: 'tools.markdown-editor',
  entry: 'tools/productivity/markdown-editor/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta