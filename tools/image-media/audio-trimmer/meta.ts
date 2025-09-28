import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'audio-trimmer',
  name: '音频裁剪器',
  description: '音频裁剪器工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:content-cut',
  i18nKey: 'tools.audio-trimmer',
  entry: 'tools/image-media/audio-trimmer/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
