import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'hashtag-generator',
  name: '标签生成器',
  description: '标签生成器工具',
  category: 'social-marketing',
  tags: ['social-marketing', '工具'],
  icon: 'mdi:pound',
  i18nKey: 'tools.hashtag-generator',
  entry: 'tools/social-marketing/hashtag-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
