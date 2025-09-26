import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'tsv-converter',
  name: 'TSV 转换器',
  description: 'TSV 转换器工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:table-arrow-right',
  i18nKey: 'tools.tsv-converter',
  entry: 'tools/data-file/tsv-converter/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta