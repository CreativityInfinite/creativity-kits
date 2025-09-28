import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'base64-decode',
  name: 'Base64 解码',
  description: '强大的 Base64 解码工具，支持标准和 URL 安全格式，提供多种输出格式、数据分析、文件预览和格式验证功能',
  category: 'text-format',
  tags: ['Base64', '解码', '数据转换', '文件处理', '编码格式', '二进制'],
  i18nKey: 'tools.base64-decode',
  entry: 'tools/text-format/base64-decode/Component.vue'
};
export default meta;
