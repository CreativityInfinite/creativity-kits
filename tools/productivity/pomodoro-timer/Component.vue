<template>
  <div class="space-y-6">
    <div class="text-center">
      <div class="inline-block p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-full">
        <div class="text-6xl font-mono font-bold text-red-600 dark:text-red-400">
          {{ formatTime(timeLeft) }}
        </div>
        <div class="text-lg text-gray-600 dark:text-gray-400 mt-2">
          {{ currentPhase }}
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-4">
      <button @click="startTimer" :disabled="isRunning" class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium">开始</button>
      <button @click="pauseTimer" :disabled="!isRunning" class="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg font-medium">暂停</button>
      <button @click="resetTimer" class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">重置</button>
      <button @click="skipPhase" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">跳过</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <h3 class="font-medium mb-2">工作时间</h3>
        <div class="flex items-center gap-2">
          <input
            v-model.number="settings.workMinutes"
            @change="updateSettings"
            type="number"
            min="1"
            max="60"
            class="w-20 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">分钟</span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <h3 class="font-medium mb-2">短休息</h3>
        <div class="flex items-center gap-2">
          <input
            v-model.number="settings.shortBreakMinutes"
            @change="updateSettings"
            type="number"
            min="1"
            max="30"
            class="w-20 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">分钟</span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <h3 class="font-medium mb-2">长休息</h3>
        <div class="flex items-center gap-2">
          <input
            v-model.number="settings.longBreakMinutes"
            @change="updateSettings"
            type="number"
            min="1"
            max="60"
            class="w-20 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">分钟</span>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-medium text-blue-900 dark:text-blue-100">今日统计</h3>
        <button @click="resetStats" class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">重置统计</button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.completedPomodoros }}</div>
          <div class="text-sm text-blue-800 dark:text-blue-200">完成番茄</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.totalWorkTime }}</div>
          <div class="text-sm text-blue-800 dark:text-blue-200">工作分钟</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.totalBreakTime }}</div>
          <div class="text-sm text-blue-800 dark:text-blue-200">休息分钟</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.currentStreak }}</div>
          <div class="text-sm text-blue-800 dark:text-blue-200">连续番茄</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-2">番茄工作法说明</h3>
      <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <li>• 工作25分钟，然后休息5分钟为一个番茄周期</li>
        <li>• 完成4个番茄周期后，进行15-30分钟的长休息</li>
        <li>• 在工作期间专注于单一任务，避免干扰</li>
        <li>• 休息时间离开工作区域，放松身心</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isRunning = ref(false)
const timeLeft = ref(25 * 60) // 25分钟，以秒为单位
const currentPhase = ref('工作时间')
const pomodoroCount = ref(0)
let timer: NodeJS.Timeout | null = null

const settings = ref({
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15
})

const stats = ref({
  completedPomodoros: 0,
  totalWorkTime: 0,
  totalBreakTime: 0,
  currentStreak: 0
})

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function startTimer() {
  if (isRunning.value) return

  isRunning.value = true
  timer = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value <= 0) {
      completePhase()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function resetTimer() {
  pauseTimer()
  timeLeft.value = settings.value.workMinutes * 60
  currentPhase.value = '工作时间'
  pomodoroCount.value = 0
}

function skipPhase() {
  completePhase()
}

function completePhase() {
  pauseTimer()

  // 播放提示音（简化版本）
  playNotificationSound()

  if (currentPhase.value === '工作时间') {
    // 完成一个番茄
    pomodoroCount.value++
    stats.value.completedPomodoros++
    stats.value.totalWorkTime += settings.value.workMinutes
    stats.value.currentStreak++

    // 决定下一个阶段
    if (pomodoroCount.value % 4 === 0) {
      // 长休息
      currentPhase.value = '长休息'
      timeLeft.value = settings.value.longBreakMinutes * 60
    } else {
      // 短休息
      currentPhase.value = '短休息'
      timeLeft.value = settings.value.shortBreakMinutes * 60
    }
  } else {
    // 休息结束，开始工作
    if (currentPhase.value === '长休息') {
      stats.value.totalBreakTime += settings.value.longBreakMinutes
    } else {
      stats.value.totalBreakTime += settings.value.shortBreakMinutes
    }

    currentPhase.value = '工作时间'
    timeLeft.value = settings.value.workMinutes * 60
  }

  // 发送浏览器通知
  sendNotification()
}

function playNotificationSound() {
  // 使用 Web Audio API 生成简单的提示音
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log('无法播放提示音')
  }
}

function sendNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('番茄工作法提醒', {
      body: `${currentPhase.value}时间到！`,
      icon: '🍅'
    })
  }
}

function updateSettings() {
  if (!isRunning.value && currentPhase.value === '工作时间') {
    timeLeft.value = settings.value.workMinutes * 60
  }
  saveSettings()
}

function resetStats() {
  stats.value = {
    completedPomodoros: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    currentStreak: 0
  }
  saveStats()
}

function saveSettings() {
  localStorage.setItem('pomodoro-settings', JSON.stringify(settings.value))
}

function loadSettings() {
  const saved = localStorage.getItem('pomodoro-settings')
  if (saved) {
    settings.value = { ...settings.value, ...JSON.parse(saved) }
  }
}

function saveStats() {
  localStorage.setItem('pomodoro-stats', JSON.stringify(stats.value))
}

function loadStats() {
  const saved = localStorage.getItem('pomodoro-stats')
  if (saved) {
    stats.value = { ...stats.value, ...JSON.parse(saved) }
  }
}

// 请求通知权限
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

onMounted(() => {
  loadSettings()
  loadStats()
  requestNotificationPermission()
  timeLeft.value = settings.value.workMinutes * 60
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  saveStats()
})
</script>
