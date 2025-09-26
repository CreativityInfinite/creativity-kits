<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">摄像头控制</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
            <video ref="videoElement" autoplay muted playsinline class="w-full h-full object-cover" :class="{ hidden: !isStreaming }" />
            <div v-if="!isStreaming" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-4xl mb-4">📷</div>
                <div class="text-lg mb-2">摄像头预览</div>
                <div class="text-sm text-gray-500">点击开启摄像头开始预览</div>
              </div>
            </div>

            <!-- 拍照倒计时 -->
            <div v-if="countdown > 0" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div class="text-6xl font-bold text-white">{{ countdown }}</div>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div class="flex gap-2">
              <button @click="startCamera" :disabled="isStreaming || isLoading" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">
                {{ isLoading ? '启动中...' : '开启摄像头' }}
              </button>
              <button @click="stopCamera" :disabled="!isStreaming" class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md">关闭摄像头</button>
            </div>

            <div class="flex gap-2">
              <button @click="takePhoto" :disabled="!isStreaming || countdown > 0" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">📸 拍照</button>
              <button @click="takePhotoWithTimer" :disabled="!isStreaming || countdown > 0" class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
                ⏰ 定时拍照
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm font-medium mb-1">摄像头</label>
                <select v-model="selectedCamera" @change="switchCamera" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                  <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
                    {{ camera.label || `摄像头 ${camera.deviceId.slice(0, 8)}` }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">分辨率</label>
                <select v-model="selectedResolution" @change="changeResolution" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                  <option v-for="res in resolutions" :key="res.label" :value="res">
                    {{ res.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm">
              <label class="flex items-center gap-2">
                <input v-model="settings.mirror" type="checkbox" class="rounded" />
                <span>镜像显示</span>
              </label>
              <label class="flex items-center gap-2">
                <input v-model="settings.flash" type="checkbox" class="rounded" />
                <span>闪光效果</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">拍照结果</h3>

        <div v-if="capturedPhoto" class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
            <img :src="capturedPhoto.dataUrl" alt="拍照结果" class="w-full h-full object-cover" />
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">尺寸:</span>
                <span>{{ capturedPhoto.width }} × {{ capturedPhoto.height }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">大小:</span>
                <span>{{ formatFileSize(capturedPhoto.size) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">格式:</span>
                <span>{{ capturedPhoto.format.toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">时间:</span>
                <span>{{ formatTime(capturedPhoto.timestamp) }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <button @click="downloadPhoto" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">💾 下载照片</button>
              <button @click="copyToClipboard" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">📋 复制图片</button>
              <button @click="retakePhoto" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm">🔄 重拍</button>
            </div>
          </div>
        </div>

        <div v-if="!capturedPhoto" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">📸</div>
          <div class="text-lg mb-2">等待拍照</div>
          <div class="text-sm">开启摄像头后点击拍照按钮</div>
        </div>
      </div>
    </div>

    <div v-if="photoHistory.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">拍照历史 ({{ photoHistory.length }})</h4>
        <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div v-for="(photo, index) in photoHistory" :key="index" class="relative group">
            <div class="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer" @click="viewPhoto(photo)">
              <img :src="photo.thumbnail" alt="历史照片" class="w-full h-full object-cover" />
            </div>
            <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="deletePhoto(index)" class="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs flex items-center justify-center">×</button>
            </div>
            <div class="text-xs text-gray-500 mt-1 text-center">{{ formatTime(photo.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">功能特点</h4>
          <ul class="space-y-1">
            <li>• 支持多摄像头切换</li>
            <li>• 可调节分辨率</li>
            <li>• 定时拍照功能</li>
            <li>• 镜像显示选项</li>
            <li>• 拍照历史记录</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">注意事项</h4>
          <ul class="space-y-1">
            <li>• 需要授权摄像头权限</li>
            <li>• 仅在HTTPS环境下工作</li>
            <li>• 照片保存在本地浏览器</li>
            <li>• 支持下载和复制功能</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface CapturedPhoto {
  dataUrl: string
  thumbnail: string
  width: number
  height: number
  size: number
  format: string
  timestamp: number
}

interface Camera {
  deviceId: string
  label: string
}

interface Resolution {
  label: string
  width: number
  height: number
}

const videoElement = ref<HTMLVideoElement>()
const canvasElement = ref<HTMLCanvasElement>()
const isStreaming = ref(false)
const isLoading = ref(false)
const countdown = ref(0)
const capturedPhoto = ref<CapturedPhoto | null>(null)
const photoHistory = ref<CapturedPhoto[]>([])
const cameras = ref<Camera[]>([])
const selectedCamera = ref('')
let currentStream: MediaStream | null = null

const settings = ref({
  mirror: true,
  flash: true
})

const resolutions: Resolution[] = [
  { label: '640×480', width: 640, height: 480 },
  { label: '1280×720 (HD)', width: 1280, height: 720 },
  { label: '1920×1080 (Full HD)', width: 1920, height: 1080 },
  { label: '2560×1440 (2K)', width: 2560, height: 1440 },
  { label: '3840×2160 (4K)', width: 3840, height: 2160 }
]

const selectedResolution = ref(resolutions[1]) // 默认720p

// 获取可用摄像头列表
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameras.value = devices
      .filter((device) => device.kind === 'videoinput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label
      }))

    if (cameras.value.length > 0 && !selectedCamera.value) {
      selectedCamera.value = cameras.value[0].deviceId
    }
  } catch (error) {
    console.error('获取摄像头列表失败:', error)
  }
}

// 开启摄像头
const startCamera = async () => {
  if (isStreaming.value) return

  isLoading.value = true

  try {
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: selectedCamera.value ? { exact: selectedCamera.value } : undefined,
        width: { ideal: selectedResolution.value.width },
        height: { ideal: selectedResolution.value.height }
      },
      audio: false
    }

    currentStream = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoElement.value) {
      videoElement.value.srcObject = currentStream
      videoElement.value.style.transform = settings.value.mirror ? 'scaleX(-1)' : 'scaleX(1)'
      isStreaming.value = true
    }
  } catch (error) {
    console.error('启动摄像头失败:', error)
    alert('无法启动摄像头，请检查权限设置')
  } finally {
    isLoading.value = false
  }
}

// 关闭摄像头
const stopCamera = () => {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop())
    currentStream = null
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }

  isStreaming.value = false
}

// 切换摄像头
const switchCamera = async () => {
  if (isStreaming.value) {
    stopCamera()
    await startCamera()
  }
}

// 改变分辨率
const changeResolution = async () => {
  if (isStreaming.value) {
    stopCamera()
    await startCamera()
  }
}

// 拍照
const takePhoto = () => {
  if (!videoElement.value || !isStreaming.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const video = videoElement.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // 应用镜像效果
  if (settings.value.mirror) {
    ctx.scale(-1, 1)
    ctx.translate(-canvas.width, 0)
  }

  // 闪光效果
  if (settings.value.flash) {
    showFlash()
  }

  ctx.drawImage(video, 0, 0)

  // 生成照片数据
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  const thumbnail = generateThumbnail(canvas)

  // 计算文件大小（估算）
  const base64Length = dataUrl.split(',')[1].length
  const size = Math.round(base64Length * 0.75)

  const photo: CapturedPhoto = {
    dataUrl,
    thumbnail,
    width: canvas.width,
    height: canvas.height,
    size,
    format: 'jpeg',
    timestamp: Date.now()
  }

  capturedPhoto.value = photo
  addToHistory(photo)
}

// 定时拍照
const takePhotoWithTimer = () => {
  if (!isStreaming.value || countdown.value > 0) return

  countdown.value = 3
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      takePhoto()
    }
  }, 1000)
}

// 生成缩略图
const generateThumbnail = (canvas: HTMLCanvasElement): string => {
  const thumbnailCanvas = document.createElement('canvas')
  const ctx = thumbnailCanvas.getContext('2d')
  if (!ctx) return ''

  const size = 150
  thumbnailCanvas.width = size
  thumbnailCanvas.height = size

  const aspectRatio = canvas.width / canvas.height
  let drawWidth = size
  let drawHeight = size
  let offsetX = 0
  let offsetY = 0

  if (aspectRatio > 1) {
    drawHeight = size / aspectRatio
    offsetY = (size - drawHeight) / 2
  } else {
    drawWidth = size * aspectRatio
    offsetX = (size - drawWidth) / 2
  }

  ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight)
  return thumbnailCanvas.toDataURL('image/jpeg', 0.7)
}

// 闪光效果
const showFlash = () => {
  const flash = document.createElement('div')
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.8;
  `

  document.body.appendChild(flash)

  setTimeout(() => {
    flash.style.opacity = '0'
    flash.style.transition = 'opacity 0.2s'
    setTimeout(() => {
      document.body.removeChild(flash)
    }, 200)
  }, 100)
}

// 下载照片
const downloadPhoto = () => {
  if (!capturedPhoto.value) return

  const link = document.createElement('a')
  link.download = `photo-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`
  link.href = capturedPhoto.value.dataUrl
  link.click()
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!capturedPhoto.value) return

  try {
    // 将base64转换为blob
    const response = await fetch(capturedPhoto.value.dataUrl)
    const blob = await response.blob()

    await navigator.clipboard.write([new ClipboardItem({ 'image/jpeg': blob })])

    alert('图片已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请尝试下载功能')
  }
}

// 重新拍照
const retakePhoto = () => {
  capturedPhoto.value = null
}

// 查看历史照片
const viewPhoto = (photo: CapturedPhoto) => {
  capturedPhoto.value = photo
}

// 删除历史照片
const deletePhoto = (index: number) => {
  photoHistory.value.splice(index, 1)
  saveHistory()
}

// 添加到历史记录
const addToHistory = (photo: CapturedPhoto) => {
  photoHistory.value.unshift(photo)

  // 限制历史记录数量
  if (photoHistory.value.length > 20) {
    photoHistory.value = photoHistory.value.slice(0, 20)
  }

  saveHistory()
}

// 清空历史记录
const clearHistory = () => {
  photoHistory.value = []
  localStorage.removeItem('webcam-photo-history')
}

// 保存历史记录
const saveHistory = () => {
  try {
    localStorage.setItem('webcam-photo-history', JSON.stringify(photoHistory.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 加载历史记录
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('webcam-photo-history')
    if (saved) {
      photoHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await getCameras()
  loadHistory()
})

onUnmounted(() => {
  stopCamera()
})
</script>
