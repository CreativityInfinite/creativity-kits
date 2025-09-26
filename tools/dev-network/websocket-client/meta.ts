import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'websocket-client',
  name: 'WebSocket 客户端',
  description: '功能完整的WebSocket测试客户端，支持实时通信和消息日志',
  category: 'dev-network',
  tags: ['WebSocket', '实时通信', '网络测试', '消息调试', 'API测试'],
  color: 'linear-gradient(135deg,#22c55e,#14b8a6)',
  icon: 'tabler:cloud-network',
  i18nKey: 'tools.websocket-client',
  entry: 'tools/dev-network/websocket-client/Component.vue',
}
export default meta