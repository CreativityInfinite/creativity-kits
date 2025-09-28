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

function pickString(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*(['"])([\s\S]*?)\1`));
  return m ? m[2] : null;
}
function hasExportDefaultMeta(src) {
  return /^export default meta\s*$/m.test(src);
}

function main() {
  const files = walk(root, []);
  const issues = {
    missing: { id: [], name: [], description: [], category: [], i18nKey: [], entry: [], exportDefault: [] },
    mismatch: { i18nKey: [], entry: [], category: [], id: [] }
  };

  files.forEach((file) => {
    const src = fs.readFileSync(file, 'utf8');
    const parts = file.split(path.sep);
    const idx = parts.lastIndexOf('tools');
    const categoryByPath = parts[idx + 1];
    const idByPath = parts[idx + 2];
    const expectedI18n = `tools.${idByPath}`;
    const expectedEntry = `tools/${categoryByPath}/${idByPath}/Component.vue`;

    const id = pickString('id', src);
    const name = pickString('name', src);
    const description = pickString('description', src);
    const category = pickString('category', src);
    const i18nKey = pickString('i18nKey', src);
    const entry = pickString('entry', src);

    if (!id) issues.missing.id.push(file);
    if (!name) issues.missing.name.push(file);
    if (!description) issues.missing.description.push(file);
    if (!category) issues.missing.category.push(file);
    if (!i18nKey) issues.missing.i18nKey.push(file);
    if (!entry) issues.missing.entry.push(file);
    if (!hasExportDefaultMeta(src)) issues.missing.exportDefault.push(file);

    if (id && id !== idByPath) issues.mismatch.id.push({ file, id, expected: idByPath });
    if (category && category !== categoryByPath) issues.mismatch.category.push({ file, category, expected: categoryByPath });
    if (i18nKey && i18nKey !== expectedI18n) issues.mismatch.i18nKey.push({ file, i18nKey, expected: expectedI18n });
    if (entry && entry !== expectedEntry) issues.mismatch.entry.push({ file, entry, expected: expectedEntry });
  });

  const summary = {
    total: files.length,
    missingCounts: Object.fromEntries(Object.entries(issues.missing).map(([k, v]) => [k, v.length])),
    mismatchCounts: Object.fromEntries(Object.entries(issues.mismatch).map(([k, v]) => [k, v.length]))
  };

  console.log(JSON.stringify({ summary, issues }, null, 2));
}

main();
