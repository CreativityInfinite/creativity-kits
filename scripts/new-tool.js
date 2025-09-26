#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const q = (s) => new Promise((res) => rl.question(s, res))

const root = process.cwd()

;(async () => {
  const category = (await q('Category id (e.g. text-format): ')).trim()
  const id = (await q('Tool id (kebab-case): ')).trim()
  const name = (await q('Name (zh-CN): ')).trim()
  const desc = (await q('Desc (zh-CN): ')).trim()
  const tags = (await q('Tags (comma separated): '))
    .trim()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  rl.close()

  if (!category || !id) {
    console.error('category and id are required.')
    process.exit(1)
  }

  const dir = path.join(root, 'tools', category, id)
  fs.mkdirSync(dir, { recursive: true })

  const meta = `import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: '${id}',
  name: '${name}',
  description: '${desc}',
  category: '${category}',
  tags: [${tags.map((t) => `'${t}'`).join(', ')}],
  i18nKey: 'tools.${id}',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  entry: 'tools/${category}/${id}/Component.vue'
}
export default meta
`
  fs.writeFileSync(path.join(dir, 'meta.ts'), meta, 'utf8')

  const comp = `<template>
  <div class="space-y-2">
    <input v-model="input" class="w-full rounded-lg bg-black/20 p-2 text-sm outline-none ring-1 ring-white/10" :placeholder="$t('${'tools.' + id + '.desc'}')" />
    <div class="rounded-lg bg-black/10 p-2 text-xs ring-1 ring-white/5">{{ result }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const input = ref('')
const result = ref('')
watch(input, (v) => { result.value = v })
</script>
`
  fs.writeFileSync(path.join(dir, 'Component.vue'), comp, 'utf8')

  // locales templates
  const localesDir = path.join(root, 'locales')
  const files = ['zh-CN.json', 'zh-TW.json', 'en.json']
  for (const f of files) {
    const p = path.join(localesDir, f)
    const json = JSON.parse(fs.readFileSync(p, 'utf8'))
    json.tools = json.tools || {}
    if (!json.tools[id]) {
      json.tools[id] = { name, desc }
      fs.writeFileSync(p, JSON.stringify(json, null, 2), 'utf8')
    }
  }

  console.log(`✔ Created tool at tools/${category}/${id}`)
})()
