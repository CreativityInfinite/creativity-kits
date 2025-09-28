import type { Ref } from 'vue';

/**
 * 统一的图标/背景计算工具，保持与首页 ToolCard 一致的视觉：
 * - 背景：优先采用传入 color；若为非渐变色，包装为线性渐变；为空则回退主题主色渐变
 * - 图标：优先字符串 icon（如 'ph:tool-bold' / 'i-...'），否则回退为 'ph:tool-bold'
 */

export function getDisplayBg(color?: string | null): string {
  const c = (color ?? '').toString().trim();
  if (!c) return 'linear-gradient(135deg, var(--color-primary, #38bdf8) 0%, rgba(255,255,255,0.2) 100%)';
  if (c.includes('gradient(')) return c;
  return `linear-gradient(135deg, ${c} 0%, rgba(255,255,255,0.2) 100%)`;
}

/**
 * 与卡片页统一的背景计算：优先 color，其次按类别映射，最后默认渐变；并统一包装渐变样式。
 * 注意：请保持此映射与 ToolCard 视觉方案一致，如需调整仅需改这里即可全站生效。
 */
const CATEGORY_COLOR_MAP: Record<string, string> = {
  // 与 ToolCard 原有渐变一致，保证两处页面统一视觉
  'text-format': 'linear-gradient(135deg,#10b981,#06b6d4)',
  'regex-parse': 'linear-gradient(135deg,#f97316,#f59e0b)',
  'time-date': 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'color-graphics': 'linear-gradient(135deg,#a855f7,#22d3ee)',
  'image-media': 'linear-gradient(135deg,#ef4444,#f97316)',
  'dev-network': 'linear-gradient(135deg,#0ea5e9,#22c55e)',
  'data-file': 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'security-privacy': 'linear-gradient(135deg,#f43f5e,#ef4444)',
  'math-unit': 'linear-gradient(135deg,#22c55e,#84cc16)',
  productivity: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
  'social-marketing': 'linear-gradient(135deg,#f59e0b,#ef4444)',
  'education-language': 'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'map-geo': 'linear-gradient(135deg,#22d3ee,#06b6d4)',
  'system-browser': 'linear-gradient(135deg,#64748b,#0ea5e9)'
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, var(--color-primary, #38bdf8) 0%, rgba(255,255,255,0.2) 100%)';

export function getDisplayBgUnified(color?: string | null, category?: string | null): string {
  const chosen = (color && color.toString().trim()) || (category ? CATEGORY_COLOR_MAP[category] : '') || '';
  return getDisplayBg(chosen || DEFAULT_GRADIENT);
}

/** 分类 → 默认图标（与 ToolCard 原有映射一致） */
const CATEGORY_ICON_MAP: Record<string, string> = {
  'text-format': 'mdi:code-braces',
  'regex-parse': 'tabler:regex',
  'time-date': 'mdi:calendar-clock',
  'color-graphics': 'mdi:palette',
  'image-media': 'mdi:image',
  'dev-network': 'tabler:cloud-network',
  'data-file': 'mdi:file-search',
  'security-privacy': 'tabler:shield-lock',
  'math-unit': 'mdi:calculator-variant',
  productivity: 'mdi:view-column',
  'social-marketing': 'mdi:camera',
  'education-language': 'mdi:translate',
  'map-geo': 'mdi:map-marker-path',
  'system-browser': 'mdi:application-cog'
};

/** 统一的图标选择：优先传入 icon 字符串，否则按分类回退，再否则默认 'tabler:apps' */
export function getDisplayIconUnified(icon?: unknown, category?: string | null): string {
  if (typeof icon === 'string' && icon.trim().length) return icon;
  if (category && CATEGORY_ICON_MAP[category]) return CATEGORY_ICON_MAP[category];
  return 'tabler:apps';
}
