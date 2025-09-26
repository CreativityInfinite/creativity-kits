import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'qr-code-generator',
  name: '二维码生成器',
  description: '多功能二维码生成工具，支持文本、网址、WiFi、名片等多种内容类型，可自定义样式和批量生成',
  category: 'dev-network',
  tags: ['二维码', 'QR码', '生成器', '批量', '自定义', '下载'],
  i18nKey: 'tools.qr-code-generator',
  entry: 'tools/dev-network/qr-code-generator/Component.vue',
}
export default meta