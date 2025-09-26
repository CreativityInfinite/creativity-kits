/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

const root = path.resolve(process.cwd(), 'FancyTools/tools')

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (e.isFile() && e.name === 'meta.ts') acc.push(p)
  }
  return acc
}

function pick(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*(['"])([\s\S]*?)\1`))
  return m ? m[2] : null
}
function pickArray(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*\[([\s\S]*?)\]`))
  return m ? `[${m[1].trim()}]` : null
}
function pickBool(field, src) {
  const m = src.match(new RegExp(field + String.raw`:\s*(true|false)`))
  return m ? m[1] : null
}

function buildMeta({ id, category, name, description, tags, icon, color, isNew, isPopular }) {
  const lines = []
  lines.push(`import type { ToolMeta } from '~/types/tool'`, ``)
  lines.push(`const meta: ToolMeta = {`)
  lines.push(`  id: '${id}',`)
  lines.push(`  name: '${name || id}',`)
  lines.push(`  description: '${description || id + ' 工具'}',`)
  lines.push(`  category: '${category}',`)

  if (tags) lines.push(`  tags: ${tags},`)
  if (color) lines.push(`  color: '${color}',`)
  if (icon) lines.push(`  icon: '${icon}',`)
  lines.push(`  i18nKey: 'tools.${id}',`)
  lines.push(`  entry: 'tools/${category}/${id}/Component.vue',`)
  if (isNew) lines.push(`  isNew: ${isNew},`)
  if (isPopular) lines.push(`  isPopular: ${isPopular},`)
  lines.push(`}`)
  lines.push(`export default meta`)
  return lines.join('\n').replace(/,\n\}$/g, '\n}')
}

function main() {
  const files = walk(root, [])
  let updated = 0
  files.forEach((file) => {
    const src = fs.readFileSync(file, 'utf8')
    const parts = file.split(path.sep)
    const idx = parts.lastIndexOf('tools')
    const category = parts[idx + 1]
    const id = parts[idx + 2]

    const name = pick('name', src)
    const description = pick('description', src)
    const tags = pickArray('tags', src)
    const icon = pick('icon', src)
    const color = pick('color', src)
    const isNew = pickBool('isNew', src)
    const isPopular = pickBool('isPopular', src)

    const normalized = buildMeta({ id, category, name, description, tags, icon, color, isNew, isPopular })
    if (normalized !== src) {
      fs.writeFileSync(file, normalized, 'utf8')
      updated++
      console.log('[normalized]', path.relative(process.cwd(), file))
    }
  })
  console.log('normalize-meta done. total:', files.length, 'updated:', updated)
}
main()
