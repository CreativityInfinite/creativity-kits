import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'excel-to-csv',
  name: 'tools.excel-to-csv.name',
  description: 'tools.excel-to-csv.desc',
  category: 'data-file',
  tags: 'tools.excel-to-csv.tags',
  icon: 'mdi:microsoft-excel',
  entry: 'tools/data-file/excel-to-csv/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
