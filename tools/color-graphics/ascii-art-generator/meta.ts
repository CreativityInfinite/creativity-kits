import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'ascii-art-generator',
  name: 'ASCII 艺术生成器',
  description: 'ASCII 艺术生成器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:format-text-variant',
  i18nKey: 'tools.ascii-art-generator',
  entry: 'tools/color-graphics/ascii-art-generator/Component.vue'
};
export default meta;
