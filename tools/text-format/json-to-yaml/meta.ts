import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'json-to-yaml',
  name: 'JSON 转 YAML',
  description: 'JSON 转 YAML工具',
  category: 'text-format',
  tags: ['text-format', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:swap-horizontal-variant',
  i18nKey: 'tools.json-to-yaml',
  entry: 'tools/text-format/json-to-yaml/Component.vue'
};
export default meta;
