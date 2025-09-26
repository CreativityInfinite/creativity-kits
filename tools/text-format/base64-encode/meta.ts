import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'base64-encode',
  name: 'Base64 编码',
  description: '将文本编码为 Base64',
  category: 'text-format',
  tags: ['text', 'encode', 'popular', 'new'],
  i18nKey: 'tools.base64-encode',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'tabler:binary',
  entry: 'tools/text-format/base64-encode/Component.vue'
}
export default meta
