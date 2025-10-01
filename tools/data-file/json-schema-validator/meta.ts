import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'json-schema-validator',
  name: 'tools.json-schema-validator.name',
  description: 'tools.json-schema-validator.desc',
  category: 'data-file',
  tags: 'tools.json-schema-validator.tags',
  icon: 'mdi:check-circle',
  entry: 'tools/data-file/json-schema-validator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
