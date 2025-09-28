import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'utm-builder',
  name: 'UTM链接构建器',
  description: '专业的UTM参数构建工具，支持营销活动跟踪链接生成、二维码生成和历史记录管理',
  category: 'social-marketing',
  tags: ['UTM', '营销跟踪', '链接生成', '二维码', '数据分析'],
  icon: 'tabler:link',
  i18nKey: 'tools.utm-builder',
  entry: 'tools/social-marketing/utm-builder/Component.vue'
};
export default meta;
