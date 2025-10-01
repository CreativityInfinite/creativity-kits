import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'json-to-yaml',
  name: 'tools.json-to-yaml.name',
  description: 'tools.json-to-yaml.desc',
  category: 'text-format',
  tags: 'tools.json-to-yaml.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:swap-horizontal-variant',
  entry: 'tools/text-format/json-to-yaml/Component.vue'
};
export default meta;
