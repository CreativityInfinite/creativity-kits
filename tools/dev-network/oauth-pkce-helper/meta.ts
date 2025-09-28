import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'oauth-pkce-helper',
  name: 'OAuth PKCE 助手',
  description: 'OAuth PKCE 助手工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  icon: 'mdi:shield-key',
  i18nKey: 'tools.oauth-pkce-helper',
  entry: 'tools/dev-network/oauth-pkce-helper/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
