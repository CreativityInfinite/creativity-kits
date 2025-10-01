import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'text-readability-analyzer',
  name: 'tools.text-readability-analyzer.name',
  description: 'tools.text-readability-analyzer.desc',
  category: 'education-language',
  tags: 'tools.text-readability-analyzer.tags',
  icon: 'mdi:text-recognition',
  entry: 'tools/education-language/text-readability-analyzer/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
