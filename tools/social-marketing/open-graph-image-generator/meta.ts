import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'open-graph-image-generator',
  name: 'Open Graph 图片生成器',
  description: 'Open Graph 图片生成器工具',
  category: 'social-marketing',
  tags: ['social-marketing', '工具'],
  icon: 'mdi:image-frame',
  i18nKey: 'tools.open-graph-image-generator',
  entry: 'tools/social-marketing/open-graph-image-generator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta