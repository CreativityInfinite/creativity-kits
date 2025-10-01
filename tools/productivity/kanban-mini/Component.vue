<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.kanban-mini.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.kanban-mini.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.kanban-mini.page.newTask') }}</label>
        <div class="flex gap-2">
          <input
            v-model="newTitle"
            type="text"
            :placeholder="$t('tools.kanban-mini.page.newTaskPlaceholder')"
            class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button @click="addTask" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.kanban-mini.page.add') }}</button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.kanban-mini.page.filter') }}</label>
        <input
          v-model="filter"
          type="text"
          :placeholder="$t('tools.kanban-mini.page.filterPlaceholder')"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KanbanColumn :title="$t('tools.kanban-mini.page.todo')" :list="filtered('todo')" @move="move" />
      <KanbanColumn :title="$t('tools.kanban-mini.page.doing')" :list="filtered('doing')" @move="move" />
      <KanbanColumn :title="$t('tools.kanban-mini.page.done')" :list="filtered('done')" @move="move" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PropType } from 'vue';

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

const KanbanColumn = defineComponent({
  name: 'KanbanColumn',
  props: {
    title: { type: String, required: true },
    list: { type: Array as PropType<Task[]>, required: true }
  },
  emits: ['move'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const moveTo = (id: string, to: Task['status']) => emit('move', id, to);
    return () =>
      h('div', { class: 'bg-white dark:bg-gray-800 rounded-lg p-4 border' }, [
        h('div', { class: 'text-sm font-medium text-gray-700 dark:text-gray-200 mb-3' }, props.title),
        h(
          'div',
          { class: 'space-y-2' },
          props.list.map((t) =>
            h('div', { key: t.id, class: 'p-3 rounded-md border dark:border-gray-700 bg-gray-50 dark:bg-gray-900' }, [
              h('div', { class: 'text-sm mb-2' }, t.title),
              h('div', { class: 'flex gap-2' }, [
                h('button', { class: 'px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded', onClick: () => moveTo(t.id, 'todo') }, t('tools.kanban-mini.page.todo')),
                h('button', { class: 'px-2 py-1 text-xs bg-blue-200 dark:bg-blue-700 rounded', onClick: () => moveTo(t.id, 'doing') }, t('tools.kanban-mini.page.doing')),
                h('button', { class: 'px-2 py-1 text-xs bg-green-200 dark:bg-green-700 rounded', onClick: () => moveTo(t.id, 'done') }, t('tools.kanban-mini.page.done'))
              ])
            ])
          )
        )
      ]);
  }
});
</script>
