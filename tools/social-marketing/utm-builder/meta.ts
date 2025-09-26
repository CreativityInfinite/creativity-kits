import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'utm-builder',
  name: 'UTM 构建器',
  description: '生成追踪参数',
  category: 'social-marketing',
  tags: ['marketing'],
  i18nKey: 'tools.utm-builder',
  color: 'linear-gradient(135deg,#ec4899,#84cc16)',
  icon: 'tabler:share-3',
  entry: 'tools/social-marketing/utm-builder/Component.vue'
}
export default meta
