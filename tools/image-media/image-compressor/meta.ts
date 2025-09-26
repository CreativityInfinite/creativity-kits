import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'image-compressor',
  name: '图片压缩器',
  description: '图片压缩器工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:compress',
  i18nKey: 'tools.image-compressor',
  entry: 'tools/image-media/image-compressor/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta