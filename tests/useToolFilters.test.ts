import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { isMatchFactory, sortByMatch } from '../composables/useToolFilters';
import type { ToolMetaRuntime } from '../types/tool';

function makeTool(id: string, category: string, tags: string[] = []): ToolMetaRuntime {
  return {
    id,
    name: id,
    description: '',
    category,
    tags,
    i18nKey: id,
    entry: '',
    component: {} as any
  };
}

describe('useToolFilters', () => {
  it('isMatchFactory matches "all" tab', () => {
    const active = ref('all');
    const isMatch = isMatchFactory(active, 'hot');
    expect(isMatch(makeTool('a', 'image', ['x']))).toBe(true);
    expect(isMatch(makeTool('b', 'video', []))).toBe(true);
  });

  it('isMatchFactory matches "hot" tab when popularTag is provided', () => {
    const active = ref('hot');
    const isMatch = isMatchFactory(active, 'pop');
    expect(isMatch(makeTool('a', 'image', ['pop']))).toBe(true);
    expect(isMatch(makeTool('b', 'video', ['x']))).toBe(false);
  });

  it('isMatchFactory matches "new" tab when tag "new" exists', () => {
    const active = ref('new');
    const isMatch = isMatchFactory(active, 'hot');
    expect(isMatch(makeTool('n1', 'image', ['new']))).toBe(true);
    expect(isMatch(makeTool('n2', 'image', []))).toBe(false);
  });

  it('isMatchFactory matches specific category id by category field', () => {
    const active = ref('image');
    const isMatch = isMatchFactory(active, 'hot');
    expect(isMatch(makeTool('a', 'image'))).toBe(true);
    expect(isMatch(makeTool('b', 'video'))).toBe(false);
  });

  it('sortByMatch sorts matched items first and keeps id lexicographic within groups', () => {
    const active = ref('image');
    const isMatch = isMatchFactory(active, 'hot');

    const a = makeTool('a', 'video');
    const b = makeTool('b', 'image');
    const c = makeTool('c', 'other');
    const d = makeTool('d', 'image');

    const arr = [a, b, c, d];
    const sorted = [...arr].sort(sortByMatch(isMatch));
    // Matches (b, d) first in id order, then non-matches (a, c) in id order
    expect(sorted.map((t) => t.id)).toEqual(['b', 'd', 'a', 'c']);
  });
});
