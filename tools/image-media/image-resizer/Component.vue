<template>
  <div class="space-y-4">
    <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="hidden" />
      <div v-if="!originalImage" class="space-y-2">
        <div class="text-4xl">📷</div>
        <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.image-resizer.page.clickOrDrag') }}</p>
        <button @click="$refs.fileInput.click()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.image-resizer.page.selectImage') }}</button>
      </div>
      <div v-else class="space-y-2">
        <img :src="originalImage" :alt="$t('tools.image-resizer.page.originalAlt')" class="max-w-full max-h-48 mx-auto rounded" />
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.image-resizer.page.originalSizeLabel') }} {{ originalWidth }} × {{ originalHeight }}</p>
        <button @click="resetImage" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.image-resizer.page.reselect') }}</button>
      </div>
    </div>

    <div v-if="originalImage" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.image-resizer.page.resizeMode') }}</label>
          <select v-model="resizeMode" @change="updatePreview" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value="exact">{{ $t('tools.image-resizer.page.modeExact') }}</option>
            <option value="width">{{ $t('tools.image-resizer.page.modeWidth') }}</option>
            <option value="height">{{ $t('tools.image-resizer.page.modeHeight') }}</option>
            <option value="fit">{{ $t('tools.image-resizer.page.modeFit') }}</option>
            <option value="percentage">{{ $t('tools.image-resizer.page.modePercentage') }}</option>
          </select>
        </div>

        <div v-if="resizeMode === 'exact' || resizeMode === 'fit'" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.image-resizer.page.width') }}</label>
            <input v-model.number="targetWidth" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.image-resizer.page.height') }}</label>
            <input v-model.number="targetHeight" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>

        <div v-if="resizeMode === 'width'" class="space-y-2">
          <label class="block text-sm font-medium">{{ $t('tools.image-resizer.page.targetWidth') }}</label>
          <input v-model.number="targetWidth" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div v-if="resizeMode === 'height'" class="space-y-2">
          <label class="block text-sm font-medium">{{ $t('tools.image-resizer.page.targetHeight') }}</label>
          <input v-model.number="targetHeight" @input="updatePreview" type="number" min="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>

        <div v-if="resizeMode === 'percentage'" class="space-y-2">
          <label class="block text-sm font-medium">{{ $t('tools.image-resizer.page.percentage') }}</label>
          <input v-model.number="percentage" @input="updatePreview" type="number" min="1" max="500" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ percentage }}%</div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.image-resizer.page.imageQuality') }}</label>
          <input v-model.number="quality" @input="updatePreview" type="range" min="0.1" max="1" step="0.1" class="w-full" />
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">{{ Math.round(quality * 100) }}%</div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="previewImage" class="text-center">
          <h3 class="font-medium mb-2">{{ $t('tools.image-resizer.page.previewTitle') }}</h3>
          <img :src="previewImage" :alt="$t('tools.image-resizer.page.previewAlt')" class="max-w-full max-h-64 mx-auto rounded border" />
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{{ $t('tools.image-resizer.page.newSizeLabel') }} {{ previewWidth }} × {{ previewHeight }}</p>
        </div>

        <div class="flex gap-2">
          <button @click="downloadImage" :disabled="!previewImage" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.image-resizer.page.downloadImage') }}
          </button>
          <button @click="copyToClipboard" :disabled="!previewImage" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.image-resizer.page.copy') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();

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
    console.error(t('tools.image-resizer.page.copyFailedLog'), err);
  }
}
</script>
