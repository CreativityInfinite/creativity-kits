import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'base64-encode',
  name: 'tools.base64-encode.name',
  description: 'tools.base64-encode.desc',
  category: 'text-format',
  tags: 'tools.base64-encode.tags',
  color: 'linear-gradient(135deg,#10b981,#3b82f6)',
  icon: 'mdi:code-braces',
  entry: 'tools/text-format/base64-encode/Component.vue'
};
export default meta;
