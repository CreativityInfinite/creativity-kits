import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'gradient-generator',
  name: '渐变生成器',
  description: '渐变生成器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:gradient-horizontal',
  i18nKey: 'tools.gradient-generator',
  entry: 'tools/color-graphics/gradient-generator/Component.vue'
};
export default meta;
