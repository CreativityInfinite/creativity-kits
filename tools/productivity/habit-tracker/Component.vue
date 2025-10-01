<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.habit-tracker.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.habit-tracker.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.habit-tracker.page.newHabit') }}</label>
        <div class="flex gap-2">
          <input
            v-model="newHabit"
            type="text"
            :placeholder="$t('tools.habit-tracker.page.newHabitPlaceholder')"
            class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button @click="addHabit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.habit-tracker.page.add') }}</button>
        </div>
      </div>
      <div class="md:col-span-1">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.habit-tracker.page.weekStartLabel') }}</label>
        <input :value="weekStartStr" disabled class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div v-if="habits.length" class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="text-left text-gray-600 dark:text-gray-400">
            <th class="py-2 pr-4">{{ $t('tools.habit-tracker.page.headers.habit') }}</th>
            <th v-for="(d, i) in days" :key="i" class="py-2 px-3">{{ d }}</th>
            <th class="py-2 px-3">{{ $t('tools.habit-tracker.page.headers.weekDone') }}</th>
            <th class="py-2 px-3">{{ $t('tools.habit-tracker.page.headers.streak') }}</th>
          </tr>
        </thead>
        <tbody class="text-gray-800 dark:text-gray-200">
          <tr v-for="(h, idx) in habits" :key="h.id">
            <td class="py-2 pr-4">
              <div class="flex items-center gap-2">
                <span>{{ h.name }}</span>
                <button @click="removeHabit(idx)" class="px-2 py-1 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded border border-red-200 dark:border-red-800">
                  {{ $t('tools.habit-tracker.page.delete') }}
                </button>
              </div>
            </td>
            <td v-for="(d, i) in 7" :key="i" class="py-2 px-3">
              <input type="checkbox" v-model="h.week[i]" @change="persist()" />
            </td>
            <td class="py-2 px-3">{{ h.week.filter(Boolean).length }}/7</td>
            <td class="py-2 px-3">{{ streak(h) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('tools.habit-tracker.page.empty') }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type Habit = { id: string; name: string; week: boolean[]; lastHistory: string[] };

const { t } = useI18n();
const habits = ref<Habit[]>([]);
const newHabit = ref('');

const days = computed(() => [
  t('tools.habit-tracker.page.weekdays.mon'),
  t('tools.habit-tracker.page.weekdays.tue'),
  t('tools.habit-tracker.page.weekdays.wed'),
  t('tools.habit-tracker.page.weekdays.thu'),
  t('tools.habit-tracker.page.weekdays.fri'),
  t('tools.habit-tracker.page.weekdays.sat'),
  t('tools.habit-tracker.page.weekdays.sun')
]);
const weekStart = computed(() => {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (day - 1));
  return d;
});
const weekStartStr = computed(() => weekStart.value.toISOString().split('T')[0]);

function addHabit() {
  const name = newHabit.value.trim();
  if (!name) return;
  habits.value.push({ id: crypto.randomUUID(), name, week: Array(7).fill(false), lastHistory: [] });
  newHabit.value = '';
  persist();
}

function removeHabit(i: number) {
  habits.value.splice(i, 1);
  persist();
}

function streak(h: Habit): number {
  // 简单：从当前周向后，连续为 true 的天数（仅本周）
  let s = 0;
  for (let i = 6; i >= 0; i--)
    if (h.week[i]) s++;
    else break;
  return s;
}

function persist() {
  const save = { weekStart: weekStartStr.value, habits: habits.value };
  localStorage.setItem('habit-tracker', JSON.stringify(save));
}

function load() {
  const raw = localStorage.getItem('habit-tracker');
  if (!raw) return;
  try {
    const obj = JSON.parse(raw);
    if (obj.weekStart === weekStartStr.value && Array.isArray(obj.habits)) {
      habits.value = obj.habits;
    } else {
      // 新的一周，清空周勾选但保留名称
      habits.value = (obj.habits || []).map((h: any) => ({ id: h.id || crypto.randomUUID(), name: h.name, week: Array(7).fill(false), lastHistory: h.lastHistory || [] }));
    }
  } catch {}
}

onMounted(load);
</script>
