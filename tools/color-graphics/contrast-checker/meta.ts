import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'contrast-checker',
  name: 'tools.contrast-checker.name',
  description: 'tools.contrast-checker.desc',
  category: 'color-graphics',
  tags: 'tools.contrast-checker.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:contrast-circle',

  entry: 'tools/color-graphics/contrast-checker/Component.vue'
};
export default meta;
