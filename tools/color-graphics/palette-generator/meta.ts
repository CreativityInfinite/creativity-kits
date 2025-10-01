import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'palette-generator',
  name: 'tools.palette-generator.name',
  description: 'tools.palette-generator.desc',
  category: 'color-graphics',
  tags: 'tools.palette-generator.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:palette-advanced',
  entry: 'tools/color-graphics/palette-generator/Component.vue'
};
export default meta;
