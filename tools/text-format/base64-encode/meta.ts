import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'base64-encode',
  name: 'tools.base64-encode.meta.name',
  description: 'tools.base64-encode.meta.description',
  category: 'text-format',
  tags: [
    'Base64',
    'tools.base64-encode.meta.tags.encode',
    'tools.base64-encode.meta.tags.decode',
    'tools.base64-encode.meta.tags.fileProcessing',
    'Data URL',
    'tools.base64-encode.meta.tags.formatConversion'
  ],
  color: 'linear-gradient(135deg,#10b981,#3b82f6)',
  icon: 'mdi:code-braces',
  i18nKey: 'tools.base64-encode',
  entry: 'tools/text-format/base64-encode/Component.vue'
};
export default meta;
