import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'csv-to-json',
  name: 'tools.csv-to-json.name',
  description: 'tools.csv-to-json.desc',
  category: 'text-format',
  tags: [
    'tools.csv-to-json.meta.tags.csv',
    'tools.csv-to-json.meta.tags.json',
    'tools.csv-to-json.meta.tags.dataConversion',
    'tools.csv-to-json.meta.tags.tableData',
    'tools.csv-to-json.meta.tags.structuredData',
    'tools.csv-to-json.meta.tags.dataAnalysis'
  ],
  i18nKey: 'tools.csv-to-json',
  entry: 'tools/text-format/csv-to-json/Component.vue'
};
export default meta;
