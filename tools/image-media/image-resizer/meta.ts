import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'image-resizer',
  name: '图片缩放',
  description: '前端 Canvas 缩放',
  category: 'image-media',
  tags: ['image'],
  i18nKey: 'tools.image-resizer',
  color: 'linear-gradient(135deg,#ec4899,#7c3aed)',
  icon: 'tabler:photo',
  entry: 'tools/image-media/image-resizer/Component.vue'
}
export default meta
