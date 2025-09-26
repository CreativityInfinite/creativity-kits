import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'jwt-signer',
  name: 'JWT 签名器',
  description: 'JWT 签名器工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  icon: 'mdi:key-plus',
  i18nKey: 'tools.jwt-signer',
  entry: 'tools/dev-network/jwt-signer/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta