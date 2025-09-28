import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'audio-format-converter',
  name: '音频格式转换器',
  description: '音频格式转换器工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:music-circle',
  i18nKey: 'tools.audio-format-converter',
  entry: 'tools/image-media/audio-format-converter/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
