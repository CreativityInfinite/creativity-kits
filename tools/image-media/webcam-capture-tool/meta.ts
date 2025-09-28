import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'webcam-capture-tool',
  name: '摄像头拍照工具',
  description: '摄像头拍照工具工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:camera',
  i18nKey: 'tools.webcam-capture-tool',
  entry: 'tools/image-media/webcam-capture-tool/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
