<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">测验制作器</h1>
      <p class="text-gray-600 dark:text-gray-400">将结构化文本解析成题目 JSON。支持题干、选项、题型与答案。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">输入格式示例</label>
        <pre class="text-xs p-3 rounded-md border bg-gray-50 dark:bg-gray-800 dark:text-gray-100 overflow-auto">
Q: 世界上最高的山？
A) 珠穆朗玛峰
B) 乔戈里峰
C) 干城章嘉峰
type=single
answer=A

Q: 下面哪些是编程语言？
- JavaScript
- Python
- HTML
type=multi
answer=JavaScript,Python
        </pre>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">题库文本</label>
        <textarea v-model="raw" rows="10" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="粘贴/编写题库..." />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="parseQuiz" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">解析为 JSON</button>
      <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
    </div>

    <div v-if="jsonOut" class="space-y-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">解析结果</div>
        <textarea readonly rows="12" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white">{{ jsonOut }}</textarea>
      </div>
      <div class="flex justify-center gap-3">
        <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">复制</button>
        <button @click="download" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">下载 JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const raw = ref('');
const items = ref<Array<{ question: string; options: string[]; answer: string | string[]; type: 'single' | 'multi' }>>([]);

const jsonOut = computed(() => (items.value.length ? JSON.stringify({ items: items.value }, null, 2) : ''));

function parseQuiz() {
  const text = (raw.value || '').trim();
  items.value = [];
  if (!text) return;
  const blocks = text.split(/\n{2,}/);

  for (const b of blocks) {
    const lines = b
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) continue;
    let q = '';
    const options: string[] = [];
    let answer: string | string[] = '';
    let type: 'single' | 'multi' = 'single';

    for (const l of lines) {
      if (/^q[:：]/i.test(l)) {
        q = l.replace(/^q[:：]\s*/i, '');
        continue;
      }
      const mAns = l.match(/^answer\s*=\s*(.+)$/i);
      if (mAns) {
        const a = mAns[1].trim();
        answer = /,/.test(a) ? a.split(/\s*,\s*/).filter(Boolean) : a;
        continue;
      }
      const mType = l.match(/^type\s*=\s*(\w+)/i);
      if (mType) {
        type = mType[1].toLowerCase() === 'multi' ? 'multi' : 'single';
        continue;
      }
      if (/^[A-Z][\)\.\s]+/.test(l) || /^[-•]\s+/.test(l)) {
        options.push(l.replace(/^[A-Z][\)\.\s]+|^[-•]\s+/, ''));
        continue;
      }
      if (!q) q = l;
    }
    if (q) items.value.push({ question: q, options, answer, type });
  }
}

function clearAll() {
  raw.value = '';
  items.value = [];
}

async function copy() {
  if (!jsonOut.value) return;
  try {
    await navigator.clipboard.writeText(jsonOut.value);
    alert('已复制');
  } catch {
    alert('复制失败，请手动复制');
  }
}

function download() {
  if (!jsonOut.value) return;
  const blob = new Blob([jsonOut.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quiz.json';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
