import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'aes-encrypt-decrypt',
  name: 'AES 加密/解密',
  description: '基于Web Crypto API的AES-256-GCM加密解密工具，提供强加密和数据完整性验证',
  category: 'security-privacy',
  tags: ['AES', '加密', '解密', 'GCM', '安全', '密码学'],
  i18nKey: 'tools.aes-encrypt-decrypt',
  entry: 'tools/security-privacy/aes-encrypt-decrypt/Component.vue'
};
export default meta;
