import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'twofa-totp-generator',
  name: 'tools.twofa-totp-generator.name',
  description: 'tools.twofa-totp-generator.desc',
  category: 'security-privacy',
  tags: 'tools.twofa-totp-generator.tags',
  icon: 'mdi:two-factor-authentication',
  entry: 'tools/security-privacy/twofa-totp-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
