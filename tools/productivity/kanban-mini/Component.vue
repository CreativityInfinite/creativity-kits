<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">迷你看板</h1>
      <p class="text-gray-600 dark:text-gray-400">轻量任务管理：三列（待办/进行中/已完成），支持新增与列间移动。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">新任务</label>
        <div class="flex gap-2">
          <input v-model="newTitle" type="text" placeholder="输入任务标题..." class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <button @click="addTask" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">添加</button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">筛选</label>
        <input v-model="filter" type="text" placeholder="关键字过滤..." class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KanbanColumn title="待办" :list="filtered('todo')" @move="move" />
      <KanbanColumn title="进行中" :list="filtered('doing')" @move="move" />
      <KanbanColumn title="已完成" :list="filtered('done')" @move="move" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type Task = { id: string; title: string; status: 'todo' | 'doing' | 'done' };

const tasks = ref<Task[]>([]);
const newTitle = ref('');
const filter = ref('');

function addTask() {
  const t = newTitle.value.trim();
  if (!t) return;
  tasks.value.push({ id: crypto.randomUUID(), title: t, status: 'todo' });
  newTitle.value = '';
}

function filtered(status: Task['status']) {
  const f = filter.value.trim().toLowerCase();
  return tasks.value.filter((t) => t.status === status && (!f || t.title.toLowerCase().includes(f)));
}

function move(id: string, to: Task['status']) {
  const t = tasks.value.find((x) => x.id === id);
  if (t) t.status = to;
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default {};
</script>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
</script>

<template #KanbanColumn="{ title, list, move }"></template>

<script lang="ts">
import { defineComponent } from 'vue';
export const KanbanColumn = defineComponent({
  name: 'KanbanColumn',
  props: {
    title: { type: String, required: true },
    list: { type: Array, required: true }
  },
  emits: ['move'],
  setup(props, { emit }) {
    const moveTo = (id: string, to: 'todo' | 'doing' | 'done') => emit('move', id, to);
    return { moveTo, props };
  },
  template: `
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
    <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">{{ title }}</div>
    <div class="space-y-2">
      <div v-for="t in list" :key="t.id" class="p-3 rounded-md border dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div class="text-sm mb-2">{{ t.title }}</div>
        <div class="flex gap-2">
          <button @click="moveTo(t.id, 'todo')" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">待办</button>
          <button @click="moveTo(t.id, 'doing')" class="px-2 py-1 text-xs bg-blue-200 dark:bg-blue-700 rounded">进行中</button>
          <button @click="moveTo(t.id, 'done')" class="px-2 py-1 text-xs bg-green-200 dark:bg-green-700 rounded">已完成</button>
        </div>
      </div>
    </div>
  </div>
  `
});
</script>
