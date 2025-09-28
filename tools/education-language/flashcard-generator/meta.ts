import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'flashcard-generator',
  name: '闪卡生成器',
  description: '智能闪卡学习工具，支持批量创建、分类管理、多种学习模式和间隔重复算法',
  category: 'education-language',
  tags: ['闪卡', '学习', '记忆', '间隔重复', '教育'],
  i18nKey: 'tools.flashcard-generator',
  entry: 'tools/education-language/flashcard-generator/Component.vue'
};
export default meta;
