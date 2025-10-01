import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'rsa-keypair-generator',
  name: 'tools.rsa-keypair-generator.name',
  description: 'tools.rsa-keypair-generator.desc',
  category: 'security-privacy',
  tags: 'tools.rsa-keypair-generator.tags',
  icon: 'mdi:key-chain',
  entry: 'tools/security-privacy/rsa-keypair-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
