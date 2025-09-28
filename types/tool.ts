export type ToolMeta = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  i18nKey: string;
  color?: string;
  icon?: string; // Iconify icon name, e.g. "tabler:binary"
  entry: string; // component path (for reference)
  isNew?: boolean;
  isPopular?: boolean;
};

export type ToolMetaRuntime = ToolMeta & {
  component: any; // async component resolved at runtime
};
