import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'jwt-decoder',
  name: 'JWT 解码',
  description: '本地解析，不联网',
  category: 'dev-network',
  tags: ['jwt', 'dev', 'new'],
  color: 'linear-gradient(135deg,#22d3ee,#84cc16)',
  icon: 'tabler:shield-lock',
  i18nKey: 'tools.jwt-decoder',
  entry: 'tools/dev-network/jwt-decoder/Component.vue',
}
export default meta