import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'hash-generator',
  name: '哈希生成器',
  description: '哈希生成器工具',
  category: 'security-privacy',
  tags: ['security-privacy', '工具'],
  icon: 'mdi:pound-box',
  i18nKey: 'tools.hash-generator',
  entry: 'tools/security-privacy/hash-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
