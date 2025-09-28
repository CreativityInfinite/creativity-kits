import { onMounted } from 'vue';
import { useThemePalette } from '~/composables/useThemePalette';

type Mode = 'light' | 'dark';

function supportsViewTransition() {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 应用基于 View Transitions API 的径向过渡
 */
async function applyViewTransition(next: Mode, apply: () => void) {
  const html = document.documentElement;
  const dir = next === 'dark' ? 'to-dark' : 'to-light';
  html.setAttribute('data-theme-switch', dir);
  // @ts-expect-error startViewTransition is experimental
  const vt = (document as any).startViewTransition(() => {
    apply();
  });
  try {
    await vt.finished;
  } finally {
    html.removeAttribute('data-theme-switch');
  }
}

/**
 * 回退方案：创建一个全屏遮罩，使用目标主题背景色，按方向径向扩散
 */
async function applyFallbackOverlay(next: Mode, apply: () => void) {
  const html = document.documentElement;
  const overlay = document.createElement('div');
  overlay.className = 'theme-wipe-overlay';
  overlay.setAttribute('data-dir', next === 'dark' ? 'to-dark' : 'to-light');

  // 使用 CSS 变量近似页面背景色（在 animations.css 中定义）
  overlay.style.background = next === 'dark' ? 'var(--bg-dark, #0a0a0a)' : 'var(--bg-light, #ffffff)';
  // 初始 clip-path 与 transform-origin 配合，确保方向感
  // 坐标：左下(0% 100%)；右上(100% 0%)
  if (next === 'dark') {
    overlay.style.setProperty('--wipe-cx', '0%');
    overlay.style.setProperty('--wipe-cy', '100%');
    overlay.style.animationName = 'wipe-grow';
  } else {
    overlay.style.setProperty('--wipe-cx', '100%');
    overlay.style.setProperty('--wipe-cy', '0%');
    overlay.style.animationName = 'wipe-grow';
  }
  overlay.style.animationDuration = '600ms';
  overlay.style.animationTimingFunction = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  overlay.style.animationFillMode = 'forwards';

  // 在动画开始前不要立即切换主题，让遮罩呈现“盖上去”的效果
  document.body.appendChild(overlay);

  await new Promise<void>((resolve) => {
    overlay.addEventListener(
      'animationend',
      () => {
        resolve();
      },
      { once: true }
    );
  });

  // 动画覆盖完成后，切换主题并移除遮罩
  apply();
  // 轻微延迟，避免闪烁
  setTimeout(() => {
    overlay.remove();
  }, 10);
}

export function useFancyThemeTransition() {
  const { setMode } = useThemePalette();

  async function setModeWithTransition(next: Mode) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // SSR 安全：直接应用
      setMode(next);
      return;
    }
    if (prefersReducedMotion()) {
      setMode(next);
      return;
    }
    const apply = () => setMode(next);
    try {
      if (supportsViewTransition()) {
        await applyViewTransition(next, apply);
      } else {
        await applyFallbackOverlay(next, apply);
      }
    } catch {
      setMode(next);
    }
  }

  return {
    setModeWithTransition
  };
}
