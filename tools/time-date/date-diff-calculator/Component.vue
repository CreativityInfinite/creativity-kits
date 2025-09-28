<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">开始日期</label>
        <input v-model="startDate" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">结束日期</label>
        <input v-model="endDate" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div v-if="result" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-2">时间差</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-600 dark:text-gray-400">天数:</span>
          <span class="ml-1 font-mono">{{ result.days }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-400">小时:</span>
          <span class="ml-1 font-mono">{{ result.hours }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-400">分钟:</span>
          <span class="ml-1 font-mono">{{ result.minutes }}</span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-400">秒:</span>
          <span class="ml-1 font-mono">{{ result.seconds }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const startDate = ref('');
const endDate = ref('');

const result = computed(() => {
  if (!startDate.value || !endDate.value) return null;

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const diff = Math.abs(end.getTime() - start.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds };
});

// 设置默认值
startDate.value = new Date().toISOString().split('T')[0];
endDate.value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
</script>
