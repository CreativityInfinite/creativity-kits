import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'color-blindness-simulator',
  name: 'tools.color-blindness-simulator.name',
  description: 'tools.color-blindness-simulator.desc',
  category: 'color-graphics',
  tags: 'tools.color-blindness-simulator.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:eye-off',
  entry: 'tools/color-graphics/color-blindness-simulator/Component.vue'
};
export default meta;
