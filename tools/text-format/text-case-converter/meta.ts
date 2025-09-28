import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'text-case-converter',
  name: '文本大小写转换',
  description: '全面的文本大小写转换工具，支持10种转换格式包括驼峰、蛇形、烤肉串等编程命名规范，提供文本分析和批量处理功能',
  category: 'text-format',
  tags: ['文本转换', '大小写', '驼峰命名', '蛇形命名', '编程规范', '格式化'],
  i18nKey: 'tools.text-case-converter',
  entry: 'tools/text-format/text-case-converter/Component.vue'
};
export default meta;
