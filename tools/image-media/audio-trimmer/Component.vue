<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.audio-trimmer.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.audio-trimmer.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.audio-trimmer.page.selectAudio') }}</label>
        <input type="file" accept="audio/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.audio-trimmer.page.startTime') }}</label>
        <input v-model.number="startSec" type="number" min="0" step="0.1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.audio-trimmer.page.endTime') }}</label>
        <input v-model.number="endSec" type="number" min="0" step="0.1" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="trim" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.audio-trimmer.page.trim') }}</button>
      <button v-if="outUrl" @click="download" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.audio-trimmer.page.download') }}</button>
    </div>

    <div v-if="audioUrl" class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.audio-trimmer.page.originalAudio') }}</div>
      <audio :src="audioUrl" controls class="w-full"></audio>
    </div>

    <div v-if="outUrl" class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.audio-trimmer.page.resultPreview') }}</div>
      <audio :src="outUrl" controls class="w-full"></audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const file = ref<File | null>(null);
const audioUrl = ref('');
const outUrl = ref('');
const startSec = ref(0);
const endSec = ref(0);

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  file.value = t.files?.[0] || null;
  audioUrl.value = file.value ? URL.createObjectURL(file.value) : '';
  outUrl.value = '';
}

async function trim() {
  outUrl.value = '';
  if (!file.value) {
    alert(t('tools.audio-trimmer.page.alertSelectAudio'));
    return;
  }
  const arrayBuf = await file.value.arrayBuffer();
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(arrayBuf.slice(0));
  const sr = decoded.sampleRate;
  const ch = decoded.numberOfChannels;

  const start = Math.max(0, Math.min(decoded.duration, startSec.value || 0));
  const end = Math.max(start, Math.min(decoded.duration, endSec.value || decoded.duration));
  const frames = Math.floor((end - start) * sr);

  const outBuf = ctx.createBuffer(ch, frames, sr);
  for (let c = 0; c < ch; c++) {
    const src = decoded.getChannelData(c);
    const dst = outBuf.getChannelData(c);
    const startIdx = Math.floor(start * sr);
    for (let i = 0; i < frames; i++) dst[i] = src[startIdx + i] || 0;
  }
  outUrl.value = bufferToWavUrl(outBuf);
}

function bufferToWavUrl(buffer: AudioBuffer) {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numCh * 2 + 44;
  const ab = new ArrayBuffer(length);
  const view = new DataView(ab);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  let offset = 0;
  writeStr(offset, 'RIFF');
  offset += 4;
  view.setUint32(offset, 36 + buffer.length * numCh * 2, true);
  offset += 4;
  writeStr(offset, 'WAVE');
  offset += 4;
  writeStr(offset, 'fmt ');
  offset += 4;
  view.setUint32(offset, 16, true);
  offset += 4; // PCM chunk size
  view.setUint16(offset, 1, true);
  offset += 2; // audio format = PCM
  view.setUint16(offset, numCh, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, sampleRate * numCh * 2, true);
  offset += 4; // byte rate
  view.setUint16(offset, numCh * 2, true);
  offset += 2; // block align
  view.setUint16(offset, 16, true);
  offset += 2; // bits per sample
  writeStr(offset, 'data');
  offset += 4;
  view.setUint32(offset, buffer.length * numCh * 2, true);
  offset += 4;

  // Interleave
  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  let idx = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][i]));
      sample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset + idx, sample | 0, true);
      idx += 2;
    }
  }

  const blob = new Blob([view], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function download() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = 'trimmed.wav';
  a.click();
}
</script>
