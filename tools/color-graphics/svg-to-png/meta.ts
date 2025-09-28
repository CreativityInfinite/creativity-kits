import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'svg-to-png',
  name: 'SVG 转 PNG',
  description: 'SVG 转 PNG工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:image-convert',
  i18nKey: 'tools.svg-to-png',
  entry: 'tools/color-graphics/svg-to-png/Component.vue'
};
export default meta;
