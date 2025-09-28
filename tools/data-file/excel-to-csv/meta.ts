import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'excel-to-csv',
  name: 'Excel 转 CSV',
  description: 'Excel 转 CSV工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:microsoft-excel',
  i18nKey: 'tools.excel-to-csv',
  entry: 'tools/data-file/excel-to-csv/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
