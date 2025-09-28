/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const toolsRoot = path.resolve(process.cwd(), 'FancyTools/tools');
const localesRoot = path.resolve(process.cwd(), 'FancyTools/i18n/locales');

function walkMetaFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMetaFiles(p, acc);
    else if (e.isFile() && e.name === 'meta.ts') acc.push(p);
  }
  return acc;
}
function pick(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*(['"])([\s\S]*?)\1`));
  return m ? m[2] : null;
}
function titleCaseFromId(id) {
  // keep common acronyms uppercased
  const acronyms = new Set(['JSON', 'YAML', 'CSV', 'TSV', 'URL', 'HTML', 'JWT', 'AES', 'RSA', 'IP', 'QR', 'PDF', 'SVG', 'EXIF', 'IPA', 'OG', 'ICS', 'UUID']);
  return id
    .split('-')
    .map((w) => {
      const up = w.toUpperCase();
      if (acronyms.has(up)) return up;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}
function sentenceFromId(id) {
  // Simple heuristic description
  const name = titleCaseFromId(id);
  return `${name} tool`;
}
function main() {
  if (!fs.existsSync(localesRoot)) {
    console.log('[adapt-locales] locales dir not found');
    process.exit(0);
  }
  const metas = walkMetaFiles(toolsRoot, [])
    .map((file) => {
      const src = fs.readFileSync(file, 'utf8');
      const id = pick('id', src);
      const name = pick('name', src);
      const description = pick('description', src);
      const i18nKey = pick('i18nKey', src);
      return { id, name, description, i18nKey };
    })
    .filter((m) => m.id && m.i18nKey);

  const localeFiles = ['en.json', 'zh-CN.json', 'zh-TW.json'].filter((f) => fs.existsSync(path.join(localesRoot, f)));
  const result = {};
  for (const lf of localeFiles) {
    const p = path.join(localesRoot, lf);
    const json = JSON.parse(fs.readFileSync(p, 'utf8') || '{}');
    if (!json.tools || typeof json.tools !== 'object') json.tools = {};
    let changed = 0;
    for (const m of metas) {
      if (!json.tools[m.id] || typeof json.tools[m.id] !== 'object') json.tools[m.id] = {};
      let nextName, nextDesc;
      if (lf === 'en.json') {
        nextName = titleCaseFromId(m.id);
        nextDesc = sentenceFromId(m.id);
      } else if (lf === 'zh-CN.json') {
        nextName = m.name || m.id;
        nextDesc = m.description || (m.name ? m.name + ' 工具' : m.id + ' 工具');
      } else {
        // zh-TW.json
        nextName = m.name || m.id;
        nextDesc = m.description || (m.name ? m.name + ' 工具' : m.id + ' 工具');
      }
      if (json.tools[m.id].name !== nextName) {
        json.tools[m.id].name = nextName;
        changed++;
      }
      if (json.tools[m.id].desc !== nextDesc) {
        json.tools[m.id].desc = nextDesc;
        changed++;
      }
    }
    fs.writeFileSync(p, JSON.stringify(json, null, 2), 'utf8');
    result[lf] = changed;
  }
  console.log('[adapt-locales] done', JSON.stringify(result, null, 2));
}
main();
