import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'resume-builder',
  name: '简历生成器',
  description: '简历生成器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:account-box',
  i18nKey: 'tools.resume-builder',
  entry: 'tools/productivity/resume-builder/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
