<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.video-gif-converter.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.video-gif-converter.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.video-gif-converter.page.selectVideo') }}</label>
        <input type="file" accept="video/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.video-gif-converter.page.fps') }}</label>
        <input v-model.number="fps" type="number" min="1" max="30" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.video-gif-converter.page.width') }}</label>
        <input v-model.number="outWidth" type="number" min="64" max="800" step="1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.video-gif-converter.page.startTime') }}</label>
        <input v-model.number="startSec" type="number" min="0" step="0.1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.video-gif-converter.page.endTime') }}</label>
        <input v-model.number="endSec" type="number" min="0" step="0.1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.video-gif-converter.page.quality') }}</label>
        <input v-model.number="quality" type="number" min="0" max="1" step="0.05" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="convert" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md" :disabled="loading">
        {{ loading ? $t('tools.video-gif-converter.page.processing') : $t('tools.video-gif-converter.page.start') }}
      </button>
      <button v-if="gifUrl" @click="download" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.video-gif-converter.page.downloadGif') }}</button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-700 dark:text-red-200 text-sm">{{ error }}</div>

    <div v-if="videoUrl || gifUrl" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.video-gif-converter.page.originalVideo') }}</div>
        <video :src="videoUrl" controls class="w-full rounded-md"></video>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border text-center">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.video-gif-converter.page.gifResult') }}</div>
        <img v-if="gifUrl" :src="gifUrl" class="inline-block max-w-full rounded-md border dark:border-gray-700" />
        <div v-else class="text-gray-500 text-sm">{{ $t('tools.video-gif-converter.page.empty') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const file = ref<File | null>(null);
const videoUrl = ref('');
const gifUrl = ref('');
const fps = ref(6);
const outWidth = ref(320);
const startSec = ref(0);
const endSec = ref<number | null>(null);
const quality = ref(0.8);
const loading = ref(false);
const error = ref('');

const { t } = useI18n();

function onFile(e: Event) {
  const target = e.target as HTMLInputElement;
  file.value = target.files?.[0] || null;
  videoUrl.value = file.value ? URL.createObjectURL(file.value) : '';
  gifUrl.value = '';
  error.value = '';
}

async function convert() {
  error.value = '';
  gifUrl.value = '';
  if (!file.value) {
    error.value = t('tools.video-gif-converter.page.selectVideoFirst');
    return;
  }
  loading.value = true;
  try {
    const vid = document.createElement('video');
    vid.muted = true;
    vid.preload = 'auto';
    vid.src = videoUrl.value;
    await vid.play().catch(() => Promise.resolve()); // 触发元数据加载
    await waitEvent(vid, 'loadedmetadata');

    const duration = vid.duration;
    const begin = Math.max(0, Math.min(duration, startSec.value || 0));
    const end = endSec.value == null ? duration : Math.max(begin, Math.min(duration, endSec.value));

    const canvas = document.createElement('canvas');
    const scale = outWidth.value || 320;
    const h = (vid.videoHeight / vid.videoWidth) * scale;
    canvas.width = Math.max(64, Math.floor(scale));
    canvas.height = Math.max(64, Math.floor(h));
    const ctx = canvas.getContext('2d')!;

    // @ts-ignore
    const GIFMod: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js');
    // Web Worker 路径
    const workerScript = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';
    const gif = new (GIFMod as any)({
      workers: 2,
      workerScript,
      quality: Math.round((1 - Math.max(0, Math.min(1, quality.value))) * 30) + 1,
      width: canvas.width,
      height: canvas.height,
      transparent: null
    });

    const step = 1 / Math.max(1, Math.min(30, fps.value || 6));
    for (let t = begin; t < end; t += step) {
      await seekTo(vid, t);
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      gif.addFrame(ctx, { copy: true, delay: Math.round(step * 1000) });
    }

    const blob: Blob = await new Promise((resolve, reject) => {
      gif.on('finished', (b: Blob) => resolve(b));
      gif.on('abort', () => reject(new Error(t('tools.video-gif-converter.page.gifAborted'))));
      gif.render();
    });
    gifUrl.value = URL.createObjectURL(blob);
  } catch (e: any) {
    error.value = e?.message || t('tools.video-gif-converter.page.convertFailed');
  } finally {
    loading.value = false;
  }
}

function waitEvent(el: EventTarget, name: string) {
  return new Promise<void>((resolve) => el.addEventListener(name, () => resolve(), { once: true }));
}

function seekTo(vid: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const onSeeked = () => {
      vid.removeEventListener('seeked', onSeeked);
      resolve();
    };
    vid.addEventListener('seeked', onSeeked, { once: true });
    vid.currentTime = t;
  });
}

function download() {
  if (!gifUrl.value) return;
  const a = document.createElement('a');
  a.href = gifUrl.value;
  a.download = 'output.gif';
  a.click();
}
</script>
