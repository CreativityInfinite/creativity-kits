<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">源时区</label>
        <div class="space-y-2">
          <select v-model="fromTimezone" @change="convert" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </select>
          <input v-model="sourceTime" @input="convert" type="datetime-local" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">目标时区</label>
        <div class="space-y-2">
          <select v-model="toTimezone" @change="convert" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </select>
          <input v-model="targetTime" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono" placeholder="转换结果" />
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-4">
      <button @click="setCurrentTime" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">使用当前时间</button>
      <button @click="swapTimezones" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">⇄ 交换时区</button>
    </div>

    <div v-if="timeDifference" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div class="text-sm text-blue-800 dark:text-blue-200">
        <p><strong>时差:</strong> {{ timeDifference }}</p>
        <p><strong>UTC偏移:</strong> {{ fromTimezone }} → {{ toTimezone }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const fromTimezone = ref('Asia/Shanghai');
const toTimezone = ref('America/New_York');
const sourceTime = ref('');
const targetTime = ref('');

const timezones = [
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
  { value: 'America/New_York', label: '纽约时间 (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: '洛杉矶时间 (UTC-8/-7)' },
  { value: 'Europe/London', label: '伦敦时间 (UTC+0/+1)' },
  { value: 'Europe/Paris', label: '巴黎时间 (UTC+1/+2)' },
  { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
  { value: 'Asia/Dubai', label: '迪拜时间 (UTC+4)' },
  { value: 'Australia/Sydney', label: '悉尼时间 (UTC+10/+11)' },
  { value: 'Asia/Kolkata', label: '印度时间 (UTC+5:30)' }
];

const timeDifference = computed(() => {
  if (!sourceTime.value) return '';

  try {
    const sourceDate = new Date(sourceTime.value);
    const targetDate = new Date(targetTime.value);

    const diffMs = targetDate.getTime() - sourceDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 0) {
      return `目标时间比源时间快 ${Math.abs(diffHours)} 小时`;
    } else if (diffHours < 0) {
      return `目标时间比源时间慢 ${Math.abs(diffHours)} 小时`;
    } else {
      return '两个时区时间相同';
    }
  } catch {
    return '';
  }
});

function convert() {
  if (!sourceTime.value) {
    targetTime.value = '';
    return;
  }

  try {
    // 创建日期对象
    const date = new Date(sourceTime.value);

    // 使用 Intl.DateTimeFormat 进行时区转换
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: toTimezone.value,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    const hour = parts.find((p) => p.type === 'hour')?.value;
    const minute = parts.find((p) => p.type === 'minute')?.value;

    targetTime.value = `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (error) {
    targetTime.value = '转换失败';
  }
}

function setCurrentTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  sourceTime.value = `${year}-${month}-${day}T${hours}:${minutes}`;
  convert();
}

function swapTimezones() {
  const temp = fromTimezone.value;
  fromTimezone.value = toTimezone.value;
  toTimezone.value = temp;

  sourceTime.value = targetTime.value;
  convert();
}

// 初始化
setCurrentTime();
</script>
