import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'video-gif-converter',
  name: '视频转 GIF',
  description: '视频转 GIF工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:gif',
  i18nKey: 'tools.video-gif-converter',
  entry: 'tools/image-media/video-gif-converter/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta