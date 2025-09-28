import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'text-encoding-converter',
  name: '文本编码转换器',
  description: '文本编码转换器工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:format-text',
  i18nKey: 'tools.text-encoding-converter',
  entry: 'tools/data-file/text-encoding-converter/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
