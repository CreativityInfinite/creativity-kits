import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'image-metadata-sanitizer',
  name: '图片元数据清理器',
  description: '图片元数据清理器工具',
  category: 'security-privacy',
  tags: ['security-privacy', '工具'],
  icon: 'mdi:image-remove',
  i18nKey: 'tools.image-metadata-sanitizer',
  entry: 'tools/security-privacy/image-metadata-sanitizer/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta