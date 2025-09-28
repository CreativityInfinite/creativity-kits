/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const localesRoot = path.resolve(process.cwd(), 'FancyTools/i18n/locales');
const zhCNPath = path.join(localesRoot, 'zh-CN.json');
const zhTWPath = path.join(localesRoot, 'zh-TW.json');

function convertObjDeep(obj, convert) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = convert(v);
    else out[k] = convertObjDeep(v, convert);
  }
  return out;
}

async function main() {
  if (!fs.existsSync(zhCNPath) || !fs.existsSync(zhTWPath)) {
    console.log('[convert-zhTW] locales not found');
    process.exit(0);
  }
  const cn = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
  const tw = JSON.parse(fs.readFileSync(zhTWPath, 'utf8'));
  if (!cn.tools) {
    console.log('[convert-zhTW] zh-CN.tools missing');
    process.exit(0);
  }
  if (!tw.tools) tw.tools = {};

  // 动态导入 ESM 的 opencc-js，并加载 s2tw 预设
  let OpenCCFactory;
  try {
    const mod = await import('opencc-js');
    // 兼容不同导出格式
    OpenCCFactory = mod.default || mod.OpenCC || mod;
  } catch (e) {
    console.error('[convert-zhTW] failed to import opencc-js:', e.message);
    process.exit(1);
  }

  let converter;
  try {
    // 新版 opencc-js 提供 .load 载入预设，然后返回带 convert 方法的实例
    converter = await OpenCCFactory.load('s2tw.json');
  } catch (e) {
    console.error('[convert-zhTW] failed to load s2tw preset:', e.message);
    process.exit(1);
  }

  const conv = (s) => {
    if (typeof s !== 'string') return s;
    try {
      return converter.convert(s);
    } catch {
      return s;
    }
  };

  let changed = 0;
  for (const [id, obj] of Object.entries(cn.tools)) {
    if (!tw.tools[id]) tw.tools[id] = {};
    const nextName = conv(obj && obj.name);
    const nextDesc = conv(obj && obj.desc);
    if (tw.tools[id].name !== nextName) {
      tw.tools[id].name = nextName;
      changed++;
    }
    if (tw.tools[id].desc !== nextDesc) {
      tw.tools[id].desc = nextDesc;
      changed++;
    }
  }

  // 可选：同步 categories 及通用文案到繁体（保持 existing 键）
  if (cn.categories) {
    tw.categories = tw.categories || {};
    const convertedCategories = {};
    for (const [k, v] of Object.entries(cn.categories)) {
      convertedCategories[k] = conv(v);
    }
    tw.categories = { ...tw.categories, ...convertedCategories };
  }
  if (cn.common) {
    tw.common = tw.common || {};
    const convertedCommon = convertObjDeep(cn.common, conv);
    tw.common = { ...tw.common, ...convertedCommon };
  }
  if (cn.tabs) {
    tw.tabs = tw.tabs || {};
    const convertedTabs = convertObjDeep(cn.tabs, conv);
    tw.tabs = { ...tw.tabs, ...convertedTabs };
  }
  if (cn.action) {
    tw.action = tw.action || {};
    const convertedAction = convertObjDeep(cn.action, conv);
    tw.action = { ...tw.action, ...convertedAction };
  }
  if (cn.home) {
    tw.home = tw.home || {};
    const convertedHome = convertObjDeep(cn.home, conv);
    tw.home = { ...tw.home, ...convertedHome };
  }
  if (cn.themes) {
    tw.themes = tw.themes || {};
    const convertedThemes = convertObjDeep(cn.themes, conv);
    tw.themes = { ...tw.themes, ...convertedThemes };
  }

  fs.writeFileSync(zhTWPath, JSON.stringify(tw, null, 2), 'utf8');
  console.log('[convert-zhTW] done, changed:', changed);
}

main().catch((e) => {
  console.error('[convert-zhTW] unexpected error:', e);
  process.exit(1);
});
