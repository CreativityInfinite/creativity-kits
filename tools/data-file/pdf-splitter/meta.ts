import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'pdf-splitter',
  name: 'PDF 分割器',
  description: 'PDF 分割器工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:content-cut',
  i18nKey: 'tools.pdf-splitter',
  entry: 'tools/data-file/pdf-splitter/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta