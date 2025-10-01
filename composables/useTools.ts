import { ref, computed, defineAsyncComponent, markRaw } from 'vue';
import type { ToolMeta, ToolMetaRuntime } from '~/types/tool';

export async function useTools() {
  const metas = await loadMetas();
  const components = loadComponents();

  // 先构建，再做输入净化，剔除无效项，避免出现 key=undefined、i18n undefined.*、以及 ToolCard prop 类型告警
  const built = metas.map((m) => {
    const loader = components[m.id] ?? components[m.entry] ?? (() => import('~/components/Empty.vue'));
    const component = markRaw(
      defineAsyncComponent(async () => {
        const mod = await loader();
        return mod.default ?? mod;
      })
    );
    return { ...m, component } as Partial<ToolMetaRuntime> & { component: any };
  });

  const valid = built.filter((t) => {
    const hasId = typeof t.id === 'string' && t.id.length > 0;
    const hasNameOrI18n = typeof t.name === 'string';
    const hasCategory = typeof t.category === 'string' && t.category.length > 0;
    const hasComponent = !!t.component;
    return hasId && hasCategory && hasComponent && hasNameOrI18n;
  }) as ToolMetaRuntime[];

  const tools = ref<ToolMetaRuntime[]>(valid);

  const categories = computed(() => Array.from(new Set(tools.value.map((t: ToolMetaRuntime) => t.category))));
  const popularTag = 'popular';

  return { tools, categories, popularTag };
}

async function loadMetas(): Promise<ToolMeta[]> {
  // 仅加载 meta.ts 的默认导出
  const metaModules = import.meta.glob('../tools/**/meta.ts', { eager: true }) as Record<string, any>;
  const results: ToolMeta[] = [];
  for (const key of Object.keys(metaModules)) {
    const mod = metaModules[key];
    if (mod && mod.default) results.push(mod.default as ToolMeta);
  }
  return results;
}

function loadComponents() {
  // 懒加载所有工具组件
  const modules = import.meta.glob('../tools/**/Component.vue', { import: 'default' });
  // 允许以多种键访问，确保能匹配 meta.id 与 meta.entry
  const map: Record<string, any> = {};
  for (const [path, loader] of Object.entries(modules)) {
    // 例如 ../tools/text-format/base64-encode/Component.vue
    const rel = path.replace('../', ''); // tools/...
    const idByPath = rel.replace('tools/', '').replace('/Component.vue', '').replace(/\//g, '-');
    const shortId = rel.split('/').slice(-2, -1)[0]; // 取最后一级目录：base64-encode

    // 兼容多种键
    map[idByPath] = loader; // text-format-base64-encode
    map[shortId] = loader; // base64-encode（与 meta.id 对齐）
    map[path] = loader; // ../tools/...
    map[rel] = loader; // tools/...
  }
  return map;
}
