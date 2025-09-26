import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'http-requester',
  name: 'HTTP 请求工具',
  description: '功能强大的 HTTP 客户端，支持各种请求方法、自定义头部、多种数据格式，以及 cURL 导入导出功能',
  category: 'dev-network',
  tags: ['HTTP', 'API', '请求', 'REST', 'cURL', '调试', '开发工具'],
  color: 'linear-gradient(135deg,#3b82f6,#22c55e)',
  icon: 'tabler:http-get',
  i18nKey: 'tools.http-requester',
  entry: 'tools/dev-network/http-requester/Component.vue',
}
export default meta