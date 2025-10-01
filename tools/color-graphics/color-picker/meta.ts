import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'color-picker',
  name: 'tools.color-picker.name',
  description: 'tools.color-picker.desc',
  category: 'color-graphics',
  tags: 'tools.color-picker.tags',
  color: 'linear-gradient(135deg,#f59e0b,#10b981)',
  icon: 'tabler:color-picker',

  entry: 'tools/color-graphics/color-picker/Component.vue'
};
export default meta;
