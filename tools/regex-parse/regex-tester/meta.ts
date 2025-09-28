import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'regex-tester',
  name: '正则表达式测试器',
  description: '强大的正则表达式测试工具，支持匹配、替换、分割、提取等多种测试模式，提供分组高亮、语法解释和常用模式库',
  category: 'regex-parse',
  tags: ['正则表达式', '正则测试', '模式匹配', '文本处理', '捕获组', '语法高亮'],
  color: '#f59e0b',
  icon: 'tabler:regex',
  i18nKey: 'tools.regex-tester',
  entry: 'tools/regex-parse/regex-tester/Component.vue'
};
export default meta;
