<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">简历生成器</h1>
      <p class="text-gray-600 dark:text-gray-400">输入简历 JSON，生成可复制的 Markdown 简历（支持基本信息/技能/经历/教育）。</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输入 </label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入内容..."
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">处理</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"> 输出 </label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            placeholder="处理结果将显示在这里..."
          />
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">复制结果</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const output = ref('')

function process() {
  const src = input.value.trim()
  if (!src) {
    output.value = ''
    return
  }
  try {
    const data = JSON.parse(src) as {
      name?: string
      title?: string
      contact?: { email?: string; phone?: string; website?: string }
      summary?: string
      skills?: string[]
      experience?: { company?: string; role?: string; period?: string; details?: string[] }[]
      education?: { school?: string; degree?: string; period?: string; details?: string[] }[]
    }

    const lines: string[] = []
    if (data.name) lines.push(`# ${data.name}`)
    if (data.title) lines.push(`_${data.title}_`)
    lines.push('')

    if (data.contact && (data.contact.email || data.contact.phone || data.contact.website)) {
      lines.push('**联系方式**')
      if (data.contact.email) lines.push(`- 邮箱：${data.contact.email}`)
      if (data.contact.phone) lines.push(`- 电话：${data.contact.phone}`)
      if (data.contact.website) lines.push(`- 网站：${data.contact.website}`)
      lines.push('')
    }

    if (data.summary) {
      lines.push('## 概要')
      lines.push(data.summary)
      lines.push('')
    }

    if (Array.isArray(data.skills) && data.skills.length) {
      lines.push('## 技能')
      lines.push(data.skills.map((s) => `- ${s}`).join('\n'))
      lines.push('')
    }

    if (Array.isArray(data.experience) && data.experience.length) {
      lines.push('## 工作经历')
      for (const exp of data.experience) {
        const title = [exp.company, exp.role].filter(Boolean).join(' | ')
        const period = exp.period ? `（${exp.period}）` : ''
        lines.push(`- ${title}${period}`)
        if (Array.isArray(exp.details) && exp.details.length) {
          lines.push(exp.details.map((d) => `  - ${d}`).join('\n'))
        }
      }
      lines.push('')
    }

    if (Array.isArray(data.education) && data.education.length) {
      lines.push('## 教育经历')
      for (const edu of data.education) {
        const title = [edu.school, edu.degree].filter(Boolean).join(' | ')
        const period = edu.period ? `（${edu.period}）` : ''
        lines.push(`- ${title}${period}`)
        if (Array.isArray(edu.details) && edu.details.length) {
          lines.push(edu.details.map((d) => `  - ${d}`).join('\n'))
        }
      }
      lines.push('')
    }

    output.value = lines.join('\n').trim()
  } catch (e: any) {
    output.value = `解析失败：请提供有效的 JSON。示例：
{
  "name": "张三",
  "title": "前端工程师",
  "contact": { "email": "a@b.com", "phone": "123456", "website": "https://xx.com" },
  "summary": "X 年经验，熟悉 Vue/React。",
  "skills": ["JavaScript", "Vue", "Node.js"],
  "experience": [
    { "company": "某公司", "role": "前端工程师", "period": "2022-至今", "details": ["负责组件库", "性能优化"] }
  ],
  "education": [
    { "school": "某大学", "degree": "学士", "period": "2016-2020", "details": ["主修计算机科学"] }
  ]
}`
  }
}

async function copyToClipboard() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请重试')
  }
}
</script>
