import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'exif-viewer',
  name: 'EXIF 信息查看器',
  description: 'EXIF 信息查看器工具',
  category: 'image-media',
  tags: ['image-media', '工具'],
  icon: 'mdi:information',
  i18nKey: 'tools.exif-viewer',
  entry: 'tools/image-media/exif-viewer/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta