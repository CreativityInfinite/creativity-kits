import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'zip-unzip',
  name: 'ZIP 压缩解压',
  description: 'ZIP 压缩解压工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:zip-box',
  i18nKey: 'tools.zip-unzip',
  entry: 'tools/data-file/zip-unzip/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
