import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'csv-merge-split',
  name: 'CSV 合并分割',
  description: 'CSV 合并分割工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:table-split-cell',
  i18nKey: 'tools.csv-merge-split',
  entry: 'tools/data-file/csv-merge-split/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta