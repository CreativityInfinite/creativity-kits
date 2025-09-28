import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'svg-optimizer',
  name: 'SVG 优化器',
  description: 'SVG 优化器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:vector-arrange-above',
  i18nKey: 'tools.svg-optimizer',
  entry: 'tools/color-graphics/svg-optimizer/Component.vue'
};
export default meta;
