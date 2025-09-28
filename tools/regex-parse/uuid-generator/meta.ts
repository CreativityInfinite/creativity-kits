import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'uuid-generator',
  name: 'UUID 生成器',
  description: '生成各种类型的唯一标识符，支持 UUID v1/v4、Nano ID 和自定义格式，包含验证和批量生成功能',
  category: 'regex-parse',
  tags: ['UUID', 'GUID', 'Nano ID', '唯一标识符', '随机', '生成器', '验证'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:identifier',
  i18nKey: 'tools.uuid-generator',
  entry: 'tools/regex-parse/uuid-generator/Component.vue'
};
export default meta;
