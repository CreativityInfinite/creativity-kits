<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.age-calculator.page.birthDate') }}</label>
        <input v-model="birthDate" @input="calculateAge" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.age-calculator.page.targetDate') }}</label>
        <input v-model="targetDate" @input="calculateAge" type="date" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="setToday" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.age-calculator.page.setToday') }}</button>
    </div>

    <div v-if="ageResult" class="space-y-4">
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ ageResult.years }} {{ $t('tools.age-calculator.page.years') }}</div>
          <div class="text-lg text-gray-600 dark:text-gray-300">
            {{ ageResult.months }} {{ $t('tools.age-calculator.page.months') }} {{ ageResult.days }} {{ $t('tools.age-calculator.page.days') }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ ageResult.totalDays }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.age-calculator.page.totalDays') }}</div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ ageResult.totalWeeks }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.age-calculator.page.totalWeeks') }}</div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ ageResult.totalMonths }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.age-calculator.page.totalMonths') }}</div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {{ ageResult.totalHours }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.age-calculator.page.totalHours') }}</div>
        </div>
      </div>

      <div v-if="ageResult.nextBirthday" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.age-calculator.page.nextBirthday') }}</h3>
        <p class="text-sm text-yellow-800 dark:text-yellow-200">{{ $t('tools.age-calculator.page.nextBirthdayIn', { n: ageResult.nextBirthday.days }) }} （{{ ageResult.nextBirthday.date }}）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const birthDate = ref('');
const targetDate = ref('');
const ageResult = ref<any>(null);

function calculateAge() {
  if (!birthDate.value || !targetDate.value) {
    ageResult.value = null;
    return;
  }

  const birth = new Date(birthDate.value);
  const target = new Date(targetDate.value);

  if (birth > target) {
    ageResult.value = { error: t('tools.age-calculator.page.birthAfterTarget') };
    return;
  }

  // 计算精确年龄
  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // 计算总数
  const totalMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = Math.floor(totalMs / (1000 * 60 * 60));

  // 计算下次生日
  let nextBirthday = null;
  if (targetDate.value === getTodayString()) {
    const nextBirthdayDate = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthdayDate <= target) {
      nextBirthdayDate.setFullYear(target.getFullYear() + 1);
    }

    const daysToNext = Math.ceil((nextBirthdayDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    nextBirthday = {
      days: daysToNext,
      date: nextBirthdayDate.toLocaleDateString(undefined)
    };
  }

  ageResult.value = {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    nextBirthday
  };
}

function setToday() {
  targetDate.value = getTodayString();
  calculateAge();
}

function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// 初始化
setToday();
</script>
