import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'tsv-converter',
  name: 'tools.tsv-converter.name',
  description: 'tools.tsv-converter.desc',
  category: 'data-file',
  tags: 'tools.tsv-converter.tags',
  icon: 'mdi:table-arrow-right',
  entry: 'tools/data-file/tsv-converter/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
