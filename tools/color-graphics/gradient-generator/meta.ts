import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'gradient-generator',
  name: 'tools.gradient-generator.name',
  description: 'tools.gradient-generator.desc',
  category: 'color-graphics',
  tags: 'tools.gradient-generator.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:gradient-horizontal',
  entry: 'tools/color-graphics/gradient-generator/Component.vue'
};
export default meta;
