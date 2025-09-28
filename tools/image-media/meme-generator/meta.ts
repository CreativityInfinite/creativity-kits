import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'meme-generator',
  name: '表情包生成器',
  description: '表情包生成器工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:emoticon',
  i18nKey: 'tools.meme-generator',
  entry: 'tools/image-media/meme-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
