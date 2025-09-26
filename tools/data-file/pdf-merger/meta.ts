import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'pdf-merger',
  name: 'PDF 合并器',
  description: 'PDF 合并器工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:file-pdf-box',
  i18nKey: 'tools.pdf-merger',
  entry: 'tools/data-file/pdf-merger/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta