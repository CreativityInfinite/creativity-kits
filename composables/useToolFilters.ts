import type { Ref } from 'vue';
import type { ToolMetaRuntime } from '~/types/tool';

export function isMatchFactory(activeTab: Ref<string>, popularTag: string) {
  return (t: ToolMetaRuntime | undefined | null) => {
    if (!t) return false;
    const tab = activeTab.value;
    if (tab === 'all') return true;
    if (tab === 'hot') return !!t.tags?.includes(popularTag);
    if (tab === 'new') return !!t.tags?.includes('new');
    return t.category === tab;
  };
}

export function sortByMatch(isMatch: (t: ToolMetaRuntime) => boolean) {
  return (a: ToolMetaRuntime, b: ToolMetaRuntime) => {
    const am = isMatch(a) ? 1 : 0;
    const bm = isMatch(b) ? 1 : 0;
    if (bm !== am) return bm - am;
    return a.id.localeCompare(b.id);
  };
}
