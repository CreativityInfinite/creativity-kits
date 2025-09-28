import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'image-watermark',
  name: '图片水印工具',
  description: '图片水印工具工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:watermark',
  i18nKey: 'tools.image-watermark',
  entry: 'tools/image-media/image-watermark/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
