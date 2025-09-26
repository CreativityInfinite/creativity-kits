import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'clipboard-manager',
  name: '剪贴板管理',
  description: '本地历史记录',
  category: 'system-browser',
  tags: ['clipboard'],
  i18nKey: 'tools.clipboard-manager',
  color: 'linear-gradient(135deg,#ec4899,#22d3ee)',
  icon: 'tabler:browser',
  entry: 'tools/system-browser/clipboard-manager/Component.vue'
}
export default meta
