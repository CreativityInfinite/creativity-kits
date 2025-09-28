import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'twofa-totp-generator',
  name: '2FA TOTP 生成器',
  description: '2FA TOTP 生成器工具',
  category: 'security-privacy',
  tags: ['security-privacy', '工具'],
  icon: 'mdi:two-factor-authentication',
  i18nKey: 'tools.twofa-totp-generator',
  entry: 'tools/security-privacy/twofa-totp-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
