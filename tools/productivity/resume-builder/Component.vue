<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.resume-builder.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.resume-builder.page.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('tools.resume-builder.page.input') }}</label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('tools.resume-builder.page.inputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.resume-builder.page.process') }}</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('tools.resume-builder.page.output') }}</label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            :placeholder="$t('tools.resume-builder.page.outputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.resume-builder.page.copyResult') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const input = ref('');
const output = ref('');
const { t } = useI18n();

function process() {
  const src = input.value.trim();
  if (!src) {
    output.value = '';
    return;
  }
  try {
    const data = JSON.parse(src) as {
      name?: string;
      title?: string;
      contact?: { email?: string; phone?: string; website?: string };
      summary?: string;
      skills?: string[];
      experience?: { company?: string; role?: string; period?: string; details?: string[] }[];
      education?: { school?: string; degree?: string; period?: string; details?: string[] }[];
    };

    const lines: string[] = [];
    if (data.name) lines.push(`# ${data.name}`);
    if (data.title) lines.push(`_${data.title}_`);
    lines.push('');

    if (data.contact && (data.contact.email || data.contact.phone || data.contact.website)) {
      lines.push(`**${t('tools.resume-builder.page.sectionContact')}**`);
      if (data.contact.email) lines.push(`- ${t('tools.resume-builder.page.email')}：${data.contact.email}`);
      if (data.contact.phone) lines.push(`- ${t('tools.resume-builder.page.phone')}：${data.contact.phone}`);
      if (data.contact.website) lines.push(`- ${t('tools.resume-builder.page.website')}：${data.contact.website}`);
      lines.push('');
    }

    if (data.summary) {
      lines.push(`## ${t('tools.resume-builder.page.sectionSummary')}`);
      lines.push(data.summary);
      lines.push('');
    }

    if (Array.isArray(data.skills) && data.skills.length) {
      lines.push(`## ${t('tools.resume-builder.page.sectionSkills')}`);
      lines.push(data.skills.map((s) => `- ${s}`).join('\\n'));
      lines.push('');
    }

    if (Array.isArray(data.experience) && data.experience.length) {
      lines.push(`## ${t('tools.resume-builder.page.sectionExperience')}`);
      for (const exp of data.experience) {
        const title = [exp.company, exp.role].filter(Boolean).join(' | ');
        const period = exp.period ? t('tools.resume-builder.page.periodParen', { period: exp.period }) : '';
        lines.push(`- ${title}${period}`);
        if (Array.isArray(exp.details) && exp.details.length) {
          lines.push(exp.details.map((d) => `  - ${d}`).join('\\n'));
        }
      }
      lines.push('');
    }

    if (Array.isArray(data.education) && data.education.length) {
      lines.push(`## ${t('tools.resume-builder.page.sectionEducation')}`);
      for (const edu of data.education) {
        const title = [edu.school, edu.degree].filter(Boolean).join(' | ');
        const period = edu.period ? t('tools.resume-builder.page.periodParen', { period: edu.period }) : '';
        lines.push(`- ${title}${period}`);
        if (Array.isArray(edu.details) && edu.details.length) {
          lines.push(edu.details.map((d) => `  - ${d}`).join('\\n'));
        }
      }
      lines.push('');
    }

    output.value = lines.join('\n').trim();
  } catch (e: any) {
    output.value = t('tools.resume-builder.page.parseFailedExample');
  }
}

async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.resume-builder.page.copied'));
  } catch (err) {
    console.error(t('tools.resume-builder.page.copyFailedLog'), err);
    alert(t('tools.resume-builder.page.copyFailedRetry'));
  }
}
</script>
