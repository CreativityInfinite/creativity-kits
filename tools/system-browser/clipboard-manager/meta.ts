import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'clipboard-manager',
  name: 'clipboard-manager',
  description: '智能剪贴板历史记录管理工具，支持内容分类和搜索',
  category: 'system-browser',
  tags: ['剪贴板', '历史记录', '复制粘贴', '管理工具', '效率'],
  i18nKey: 'tools.clipboard-manager',
  entry: 'tools/system-browser/clipboard-manager/Component.vue'
};
export default meta;
