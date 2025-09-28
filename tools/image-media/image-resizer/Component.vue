<template>
  <div class="space-y-4">
    <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden" />
      <div v-if="!originalImage" class="space-y-2">
        <div class="text-4xl">📷</div>
        <p class="text-gray-600 dark:text-gray-400">点击选择图片或拖拽到此处</p>
        <button @click="$refs.fileInput.click()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">选择图片</button>
      </div>
      <div v-else class="space-y-2">
        <img :src="originalImage" alt="原图" class="max-w-full max-h-48 mx-auto rounded" />
        <p class="text-sm text-gray-600 dark:text-gray-400">原始尺寸: {{ originalWidth }} × {{ originalHeight }}</p>
        <button @click="resetImage" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">重新选择</button>
      </div>
    </div>

    <div v-if="originalImage" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">调整方式</label>
          <select v-model="resizeMode" @change="updatePreview" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="exact">精确尺寸</option>
            <option value="width">按宽度缩放</option>
            <option value="height">按高度缩放</option>
            <option value="fit">适应尺寸（保持比例）</option>
            <option value="percentage">按百分比缩放</option>
          </select>
        </div>

        <div v-if="resizeMode === 'exact' || resizeMode === 'fit'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium mb-1">宽度</label>
            <input v-model.number="targetWidth" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">高度</label>
            <input v-model.number="targetHeight" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>

        <div v-if="resizeMode === 'width'" class="space-y-2">
          <label class="block text-sm font-medium">目标宽度</label>
          <input v-model.number="targetWidth" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div v-if="resizeMode === 'height'" class="space-y-2">
          <label class="block text-sm font-medium">目标高度</label>
          <input v-model.number="targetHeight" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div v-if="resizeMode === 'percentage'" class="space-y-2">
          <label class="block text-sm font-medium">缩放百分比</label>
          <input v-model.number="percentage" @input="updatePreview" type="number" min="1" max="500" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ percentage }}%</div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">图片质量</label>
          <input v-model.number="quality" @input="updatePreview" type="range" min="0.1" max="1" step="0.1" class="w-full" />
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">{{ Math.round(quality * 100) }}%</div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="previewImage" class="text-center">
          <h3 class="font-medium mb-2">预览效果</h3>
          <img :src="previewImage" alt="预览" class="max-w-full max-h-64 mx-auto rounded border" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">新尺寸: {{ previewWidth }} × {{ previewHeight }}</p>
        </div>

        <div class="flex gap-2">
          <button @click="downloadImage" :disabled="!previewImage" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">下载图片</button>
          <button @click="copyToClipboard" :disabled="!previewImage" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">复制</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const fileInput = ref<HTMLInputElement>();
const originalImage = ref('');
const originalWidth = ref(0);
const originalHeight = ref(0);
const previewImage = ref('');
const previewWidth = ref(0);
const previewHeight = ref(0);

const resizeMode = ref('fit');
const targetWidth = ref(800);
const targetHeight = ref(600);
const percentage = ref(100);
const quality = ref(0.9);

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      originalImage.value = e.target?.result as string;
      originalWidth.value = img.width;
      originalHeight.value = img.height;
      targetWidth.value = img.width;
      targetHeight.value = img.height;
      nextTick(() => updatePreview());
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function resetImage() {
  originalImage.value = '';
  previewImage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function updatePreview() {
  if (!originalImage.value) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    let newWidth = targetWidth.value;
    let newHeight = targetHeight.value;

    switch (resizeMode.value) {
      case 'width':
        newHeight = (img.height * newWidth) / img.width;
        break;
      case 'height':
        newWidth = (img.width * newHeight) / img.height;
        break;
      case 'fit':
        const ratio = Math.min(newWidth / img.width, newHeight / img.height);
        newWidth = img.width * ratio;
        newHeight = img.height * ratio;
        break;
      case 'percentage':
        newWidth = img.width * (percentage.value / 100);
        newHeight = img.height * (percentage.value / 100);
        break;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    previewImage.value = canvas.toDataURL('image/jpeg', quality.value);
    previewWidth.value = Math.round(newWidth);
    previewHeight.value = Math.round(newHeight);
  };
  img.src = originalImage.value;
}

function downloadImage() {
  if (!previewImage.value) return;

  const link = document.createElement('a');
  link.download = `resized-image-${previewWidth.value}x${previewHeight.value}.jpg`;
  link.href = previewImage.value;
  link.click();
}

async function copyToClipboard() {
  if (!previewImage.value) return;

  try {
    const response = await fetch(previewImage.value);
    const blob = await response.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  } catch (err) {
    console.error('复制失败:', err);
  }
}
</script>
