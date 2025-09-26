import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'rsa-keypair-generator',
  name: 'RSA 密钥对生成器',
  description: 'RSA 密钥对生成器工具',
  category: 'security-privacy',
  tags: ['security-privacy', '工具'],
  icon: 'mdi:key-chain',
  i18nKey: 'tools.rsa-keypair-generator',
  entry: 'tools/security-privacy/rsa-keypair-generator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta