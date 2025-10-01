import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'color-format-converter',
  name: 'tools.color-format-converter.name',
  description: 'tools.color-format-converter.desc',
  category: 'color-graphics',
  tags: 'tools.color-format-converter.tags',
  color: 'linear-gradient(135deg,#f59e0b,#7c3aed)',
  icon: 'tabler:palette',

  entry: 'tools/color-graphics/color-format-converter/Component.vue'
};
export default meta;
