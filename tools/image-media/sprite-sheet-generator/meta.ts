import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'sprite-sheet-generator',
  name: '精灵图生成器',
  description: '精灵图生成器工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:grid',
  i18nKey: 'tools.sprite-sheet-generator',
  entry: 'tools/image-media/sprite-sheet-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
