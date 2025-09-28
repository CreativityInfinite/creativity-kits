import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'prime-tester-and-generator',
  name: '质数测试生成器',
  description: '质数测试生成器工具',
  category: 'math-unit',
  tags: ['math-unit', '工具'],
  icon: 'mdi:numeric',
  i18nKey: 'tools.prime-tester-and-generator',
  entry: 'tools/math-unit/prime-tester-and-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
