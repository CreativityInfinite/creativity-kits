/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.cwd(), 'FancyTools/tools');

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.isFile() && e.name === 'meta.ts') acc.push(p);
  }
  return acc;
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function write(p, content) {
  fs.writeFileSync(p, content, 'utf8');
}

function getSegs(file) {
  // .../FancyTools/tools/<category>/<tool>/meta.ts
  const parts = file.split(path.sep);
  const idx = parts.lastIndexOf('tools');
  const category = parts[idx + 1];
  const id = parts[idx + 2];
  return { category, id, relEntry: `tools/${category}/${id}/Component.vue` };
}

function pickString(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*(['"])(.*?)\1`));
  return m ? m[2] : null;
}

function pickBoolean(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*(true|false)`));
  return m ? m[1] : null;
}

function pickArray(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*\[([\s\S]*?)\]`));
  if (!m) return null;
  // keep original array content as-is
  return `[${m[1].trim()}]`;
}

function ensureMeta(file) {
  const src = read(file);

  const { category: catByPath, id: idByPath, relEntry } = getSegs(file);

  // Extract existing fields
  const name = pickString('name', src);
  const description = pickString('description', src);
  const category = pickString('category', src) || catByPath;
  const tags = pickArray('tags', src);
  const icon = pickString('icon', src);
  const color = pickString('color', src);
  const isNew = pickBoolean('isNew', src);
  const isPopular = pickBoolean('isPopular', src);

  const hasId = /[\s{,]id:\s*['"]/.test(src);
  const hasI18n = /[\s{,]i18nKey:\s*['"]/.test(src);
  const hasEntry = /[\s{,]entry:\s*['"]/.test(src);

  // If already has all required fields, skip
  if (hasId && hasI18n && hasEntry) return { updated: false };

  // Build new meta content preserving existing fields when possible
  const id = hasId ? pickString('id', src) : idByPath;
  const i18nKey = hasI18n ? pickString('i18nKey', src) : `tools.${id}`;
  const entry = hasEntry ? pickString('entry', src) : relEntry;

  // Fallbacks
  const safeName = name || id;
  const safeDesc = description || `${id} 工具`;
  const safeCategory = category || catByPath;

  const lines = [];
  lines.push(`import type { ToolMeta } from '~/types/tool'`, ``);
  lines.push(`const meta: ToolMeta = {`);
  lines.push(`  id: '${id}',`);
  lines.push(`  name: '${safeName}',`);
  lines.push(`  description: '${safeDesc}',`);
  lines.push(`  category: '${safeCategory}',`);
  if (tags) lines.push(`  tags: ${tags},`);
  if (typeof color === 'string') lines.push(`  color: '${color}',`);
  if (typeof icon === 'string') lines.push(`  icon: '${icon}',`);
  lines.push(`  i18nKey: '${i18nKey}',`);
  lines.push(`  entry: '${entry}',`);
  if (isNew) lines.push(`  isNew: ${isNew === 'true' ? 'true' : 'false'},`);
  if (isPopular) lines.push(`  isPopular: ${isPopular === 'true' ? 'true' : 'false'},`);
  // Remove trailing comma on last property
  let content = lines.join('\n').replace(/,\n(?=\s*(i18nKey|entry|isNew|isPopular)\:)/g, '\n');
  if (content.endsWith(','))
    content = content.slice(0, -1);
  content += `\n}\nexport default meta\n`;

  write(file, content);
  return { updated: true };
}

function main() {
  const files = walk(root, []);
  let total = files.length;
  let updated = 0;
  for (const f of files) {
    try {
      const res = ensureMeta(f);
      if (res.updated) {
        updated++;
        console.log('[fixed]', path.relative(process.cwd(), f));
      }
    } catch (e) {
      console.error('[error]', path.relative(process.cwd(), f), e.message);
    }
  }
  console.log('Done. meta.ts total:', total, 'updated:', updated);
}

main();