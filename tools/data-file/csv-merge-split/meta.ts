import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'csv-merge-split',
  name: 'tools.csv-merge-split.name',
  description: 'tools.csv-merge-split.desc',
  category: 'data-file',
  tags: 'tools.csv-merge-split.tags',
  icon: 'mdi:table-split-cell',
  entry: 'tools/data-file/csv-merge-split/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
