<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">{{ $t('tools.typing-practice.page.title') }}</h2>
      <div class="flex gap-2">
        <select v-model="selectedText" @change="resetPractice" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value="custom">{{ $t('tools.typing-practice.page.optionCustom') }}</option>
          <option value="english">{{ $t('tools.typing-practice.page.optionEnglish') }}</option>
          <option value="chinese">{{ $t('tools.typing-practice.page.optionChinese') }}</option>
          <option value="code">{{ $t('tools.typing-practice.page.optionCode') }}</option>
          <option value="numbers">{{ $t('tools.typing-practice.page.optionNumbers') }}</option>
        </select>
        <button @click="resetPractice" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.typing-practice.page.restart') }}</button>
      </div>
    </div>

    <div v-if="selectedText === 'custom'" class="space-y-2">
      <label class="block text-sm font-medium">{{ $t('tools.typing-practice.page.customLabel') }}</label>
      <textarea
        v-model="customText"
        rows="4"
        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        :placeholder="$t('tools.typing-practice.page.inputPlaceholder')"
      />
      <button @click="startCustomPractice" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.typing-practice.page.startPractice') }}</button>
    </div>

    <div v-if="practiceText" class="space-y-4">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div class="text-lg leading-relaxed font-mono">
          <span v-for="(char, index) in practiceText" :key="index" :class="getCharClass(index)">{{ char }}</span>
          <span v-if="currentIndex < practiceText.length" class="animate-pulse bg-blue-500 text-white">|</span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <textarea
          ref="inputArea"
          v-model="userInput"
          @input="handleInput"
          @keydown="handleKeydown"
          :disabled="isFinished"
          class="w-full h-32 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono resize-none"
          :placeholder="$t('tools.typing-practice.page.typingPlaceholder')"
        />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ wpm }}</div>
          <div class="text-sm text-blue-800 dark:text-blue-200">WPM</div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ accuracy }}%</div>
          <div class="text-sm text-green-800 dark:text-green-200">{{ $t('tools.typing-practice.page.accuracy') }}</div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ progress }}%</div>
          <div class="text-sm text-purple-800 dark:text-purple-200">{{ $t('tools.typing-practice.page.progress') }}</div>
        </div>
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ formatTime(elapsedTime) }}</div>
          <div class="text-sm text-orange-800 dark:text-orange-200">{{ $t('tools.typing-practice.page.elapsed') }}</div>
        </div>
      </div>

      <div v-if="isFinished" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <h3 class="font-medium text-green-900 dark:text-green-100 mb-2">{{ $t('tools.typing-practice.page.finishedTitle') }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-green-800 dark:text-green-200">{{ $t('tools.typing-practice.page.finalSpeed') }}</span>
            <span class="font-bold">{{ finalStats.wpm }} WPM</span>
          </div>
          <div>
            <span class="text-green-800 dark:text-green-200">{{ $t('tools.typing-practice.page.finalAccuracy') }}</span>
            <span class="font-bold">{{ finalStats.accuracy }}%</span>
          </div>
          <div>
            <span class="text-green-800 dark:text-green-200">{{ $t('tools.typing-practice.page.totalTime') }}</span>
            <span class="font-bold">{{ formatTime(finalStats.totalTime) }}</span>
          </div>
          <div>
            <span class="text-green-800 dark:text-green-200">{{ $t('tools.typing-practice.page.errors') }}</span>
            <span class="font-bold">{{ finalStats.errors }}</span>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button @click="resetPractice" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.typing-practice.page.practiceAgain') }}</button>
          <button @click="saveResult" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.typing-practice.page.saveResult') }}</button>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">{{ $t('tools.typing-practice.page.historyTitle') }}</h3>
        <div v-if="history.length > 0" class="space-y-2">
          <div v-for="(record, index) in history.slice(0, 5)" :key="index" class="flex justify-between items-center text-sm">
            <span>{{ new Date(record.date).toLocaleDateString() }}</span>
            <span>{{ record.wpm }} WPM</span>
            <span>{{ record.accuracy }}%</span>
            <span>{{ formatTime(record.time) }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{{ $t('tools.typing-practice.page.noHistory') }}</div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.typing-practice.page.guideTitle') }}</h3>
      <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <li>{{ $t('tools.typing-practice.page.tipWpm') }}</li>
        <li>{{ $t('tools.typing-practice.page.tipAccuracy') }}</li>
        <li>{{ $t('tools.typing-practice.page.tipAdvice') }}</li>
        <li>{{ $t('tools.typing-practice.page.tipPosture') }}</li>
        <li>{{ $t('tools.typing-practice.page.tipRegular') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface TypingRecord {
  date: number;
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
}

const { t } = useI18n();

const selectedText = ref('english');
const customText = ref('');
const practiceText = ref('');
const userInput = ref('');
const currentIndex = ref(0);
const startTime = ref(0);
const elapsedTime = ref(0);
const isStarted = ref(false);
const isFinished = ref(false);
const errors = ref(0);
const inputArea = ref<HTMLTextAreaElement>();
const history = ref<TypingRecord[]>([]);

let timer: number | null = null;

const sampleTexts = {
  english: `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once. It is commonly used for typing practice and font testing. Regular practice with such texts can significantly improve your typing speed and accuracy.`,

  chinese: t('tools.typing-practice.page.samples.chinese'),

  code: `function calculateWPM(characters, minutes) {
  const words = characters / 5;
  return Math.round(words / minutes);
}

const practiceText = "Hello World";
const startTime = Date.now();
console.log("Practice started");`,

  numbers: `1234567890 9876543210 1357924680 2468013579 1122334455 9988776655 1029384756 5647382910 3141592653 2718281828 1618033988 1414213562`
};

const wpm = computed(() => {
  if (!isStarted.value || elapsedTime.value === 0) return 0;
  const minutes = elapsedTime.value / 60000;
  const words = currentIndex.value / 5; // 标准：5个字符为一个单词
  return Math.round(words / minutes);
});

const accuracy = computed(() => {
  if (currentIndex.value === 0) return 100;
  const correct = currentIndex.value - errors.value;
  return Math.round((correct / currentIndex.value) * 100);
});

const progress = computed(() => {
  if (!practiceText.value) return 0;
  return Math.round((currentIndex.value / practiceText.value.length) * 100);
});

const finalStats = computed(() => ({
  wpm: wpm.value,
  accuracy: accuracy.value,
  totalTime: elapsedTime.value,
  errors: errors.value
}));

function getCharClass(index: number): string {
  if (index < currentIndex.value) {
    const userChar = userInput.value[index];
    const correctChar = practiceText.value[index];
    if (userChar === correctChar) {
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    } else {
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    }
  } else if (index === currentIndex.value) {
    return 'bg-blue-200 dark:bg-blue-800';
  }
  return 'text-gray-600 dark:text-gray-400';
}

function handleInput() {
  if (!isStarted.value) {
    startPractice();
  }

  const inputLength = userInput.value.length;

  // 检查每个字符
  for (let i = currentIndex.value; i < inputLength && i < practiceText.value.length; i++) {
    if (userInput.value[i] !== practiceText.value[i]) {
      errors.value++;
    }
    currentIndex.value++;
  }

  // 检查是否完成
  if (currentIndex.value >= practiceText.value.length) {
    finishPractice();
  }
}

function handleKeydown(event: KeyboardEvent) {
  // 防止退格键删除内容
  if (event.key === 'Backspace') {
    event.preventDefault();
  }
}

function startPractice() {
  isStarted.value = true;
  startTime.value = Date.now();

  timer = setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value;
  }, 100);
}

function finishPractice() {
  isFinished.value = true;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetPractice() {
  userInput.value = '';
  currentIndex.value = 0;
  elapsedTime.value = 0;
  errors.value = 0;
  isStarted.value = false;
  isFinished.value = false;

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  // 设置练习文本
  if (selectedText.value !== 'custom') {
    practiceText.value = sampleTexts[selectedText.value as keyof typeof sampleTexts];
  }

  nextTick(() => {
    inputArea.value?.focus();
  });
}

function startCustomPractice() {
  if (!customText.value.trim()) return;

  practiceText.value = customText.value.trim();
  resetPractice();
}

function saveResult() {
  const record: TypingRecord = {
    date: Date.now(),
    wpm: finalStats.value.wpm,
    accuracy: finalStats.value.accuracy,
    time: finalStats.value.totalTime,
    errors: finalStats.value.errors
  };

  history.value.unshift(record);

  // 只保留最近20条记录
  if (history.value.length > 20) {
    history.value = history.value.slice(0, 20);
  }

  saveHistory();
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}s`;
}

function saveHistory() {
  localStorage.setItem('typing-practice-history', JSON.stringify(history.value));
}

function loadHistory() {
  const saved = localStorage.getItem('typing-practice-history');
  if (saved) {
    history.value = JSON.parse(saved);
  }
}

onMounted(() => {
  loadHistory();
  resetPractice();
});
</script>
