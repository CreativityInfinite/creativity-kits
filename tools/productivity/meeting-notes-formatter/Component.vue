<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.meeting-notes-formatter.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.meeting-notes-formatter.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.meeting-notes-formatter.page.rawLabel') }}</label>
        <textarea
          v-model="raw"
          rows="10"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.meeting-notes-formatter.page.rawPlaceholder')"
        ></textarea>
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="formatNotes" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.meeting-notes-formatter.page.format') }}</button>
      <button v-if="md" @click="copy" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.meeting-notes-formatter.page.copyMarkdown') }}</button>
    </div>

    <div v-if="md" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.meeting-notes-formatter.page.mdPreview') }}</div>
        <div v-html="html" class="prose prose-sm dark:prose-invert max-w-none"></div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.meeting-notes-formatter.page.mdSource') }}</div>
        <textarea readonly rows="16" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white">{{ md }}</textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const raw = ref('');
const md = ref('');
const { t } = useI18n();
const html = computed(async () => {
  if (!md.value) return '';
  const { marked } = await import('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js');
  return marked.parse(md.value);
});

function formatNotes() {
  const text = (raw.value || '').trim();
  if (!text) {
    md.value = '';
    return;
  }
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sec = { time: [] as string[], attendees: [] as string[], agenda: [] as string[], discussion: [] as string[], decisions: [] as string[], actions: [] as string[] };
  for (const l of lines) {
    const m = l.match(/^(时间|与会者|议程|讨论|结论|行动项)\s*[:：]\s*(.+)$/);
    if (m) {
      const key = m[1];
      const val = m[2];
      if (key === '时间') sec.time.push(val);
      else if (key === '与会者') sec.attendees.push(val);
      else if (key === '议程') sec.agenda.push(val);
      else if (key === '讨论') sec.discussion.push(val);
      else if (key === '结论') sec.decisions.push(val);
      else if (key === '行动项') sec.actions.push(val);
    } else {
      sec.discussion.push(l);
    }
  }

  md.value = [
    `# ${t('tools.meeting-notes-formatter.page.headingTitle')}`,
    sec.time.length ? `- ${t('tools.meeting-notes-formatter.page.labelTime')}：${sec.time.join('；')}` : '',
    sec.attendees.length ? `- ${t('tools.meeting-notes-formatter.page.labelAttendees')}：${sec.attendees.join('，')}` : '',
    '',
    `## ${t('tools.meeting-notes-formatter.page.sectionAgenda')}`,
    ...(sec.agenda.length ? sec.agenda.map((i) => `- ${i}`) : [`- ${t('tools.meeting-notes-formatter.page.none')}`]),
    '',
    `## ${t('tools.meeting-notes-formatter.page.sectionDiscussion')}`,
    ...(sec.discussion.length ? sec.discussion.map((i) => `- ${i}`) : [`- ${t('tools.meeting-notes-formatter.page.none')}`]),
    '',
    `## ${t('tools.meeting-notes-formatter.page.sectionDecisions')}`,
    ...(sec.decisions.length ? sec.decisions.map((i) => `- ${i}`) : [`- ${t('tools.meeting-notes-formatter.page.none')}`]),
    '',
    `## ${t('tools.meeting-notes-formatter.page.sectionActions')}`,
    ...(sec.actions.length ? sec.actions.map((i) => `- [ ] ${i}`) : [`- ${t('tools.meeting-notes-formatter.page.none')}`])
  ]
    .filter(Boolean)
    .join('\n');
}

async function copy() {
  if (!md.value) return;
  try {
    await navigator.clipboard.writeText(md.value);
    alert(t('tools.meeting-notes-formatter.page.copied'));
  } catch {
    alert(t('tools.meeting-notes-formatter.page.copyFailed'));
  }
}
</script>
