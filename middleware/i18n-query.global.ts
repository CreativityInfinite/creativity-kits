// 全局中间件：统一处理 ?lang 参数（自动追加、别名规范化、同步 i18n.locale）
// 行为：
// - 若 URL 无 ?lang：自动以当前 i18n.locale 追加 ?lang=xx（replace，无痕）
// - 若 URL 有 ?lang：规范化为标准码（en | zh-CN | zh-TW），若与当前不同则 setLocale；必要时 replace 规范 URL
export default defineNuxtRouteMiddleware((to) => {
  const app = useNuxtApp();
  const i18n = app.$i18n as any;
  if (!i18n) return;

  // 工具：在根路径用 history.replaceState 生成 http://host?lang=xx（不含 /），其他路径用 navigateTo replace
  const isRoot = to.path === '/' || to.path === '';
  const replaceQuery = (nextQuery: Record<string, any>) => {
    // 删除空值，保持简洁
    const q: Record<string, string> = {};
    for (const k in nextQuery) {
      const v = (nextQuery as any)[k];
      if (v !== undefined && v !== null && v !== '') q[k] = String(v);
    }
    if (typeof window !== 'undefined' && isRoot) {
      const search = new URLSearchParams(q).toString();
      window.history.replaceState(null, '', search ? `?${search}` : '?');
      return;
    }
    return navigateTo({ path: to.path, query: q }, { replace: true });
  };

  const norm = (v: string) => v.toLowerCase().replace('_', '-').trim();
  const mapAlias = (v: string): string => {
    const x = norm(v);
    if (x === 'en' || x === 'en-us' || x === 'en-gb') return 'en';
    if (x === 'zh' || x === 'zh-cn' || x === 'zh-hans') return 'zh-CN';
    if (x === 'zh-tw' || x === 'zh-hant' || x === 'zh-hk') return 'zh-TW';
    return v; // 非常见别名则保持原样
  };

  const allowed = (i18n?.availableLocales ?? []) as string[];
  const current = i18n.locale?.value ?? i18n.locale;
  const raw = (to.query.lang as string | undefined)?.trim();

  // 分支 1：URL 已带 lang
  if (raw) {
    const target = mapAlias(raw);
    // 若不是允许的语言，直接忽略（不跳转，不改 locale）
    if (!allowed.includes(target)) return;

    const needSwitch = current !== target;
    const needNormalize = raw !== target;

    // 先切换语言
    if (needSwitch && typeof i18n.setLocale === 'function') {
      // setLocale 会同步 cookie i18n_redirected
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      i18n.setLocale(target);
    } else if (needSwitch && i18n?.locale?.value !== undefined) {
      i18n.locale.value = target;
    }

    // 规范化 URL 中的 lang 值（如 en-US -> en）
    if (needNormalize) {
      return replaceQuery({ ...to.query, lang: target });
    }
    return;
  }

  // 分支 2：URL 无 lang，自动补齐
  // 优先使用当前 i18n.locale；若不合法则回退默认 zh-CN 或第一个允许值
  const desired = allowed.includes(current) ? current : allowed.includes('zh-CN') ? 'zh-CN' : allowed[0];
  if (!desired) return;

  return replaceQuery({ ...to.query, lang: desired });
});
