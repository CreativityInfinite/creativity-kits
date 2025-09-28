<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">音频格式转换器</h1>
      <p class="text-gray-600 dark:text-gray-400">在浏览器中将音频转换为 WAV 或 MP3（MP3 需要前端编码，速度取决于设备性能）。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">选择音频</label>
        <input type="file" accept="audio/*" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">目标格式</label>
        <select v-model="format" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value="wav">WAV（无损）</option>
          <option value="mp3">MP3（有损）</option>
        </select>
      </div>
      <div v-if="format === 'mp3'">
        <label class="block text-sm font-medium mb-2">比特率（kbps）</label>
        <input v-model.number="bitrate" type="number" min="64" max="320" step="16" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="convert" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md" :disabled="loading">{{ loading ? '处理中…' : '开始转换' }}</button>
      <button v-if="outUrl" @click="download" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">下载</button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-700 dark:text-red-200 text-sm">{{ error }}</div>

    <div v-if="audioUrl || outUrl" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">原始音频</div>
        <audio :src="audioUrl" controls class="w-full"></audio>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">转换结果</div>
        <audio :src="outUrl" controls class="w-full"></audio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const file = ref<File | null>(null);
const audioUrl = ref('');
const outUrl = ref('');
const format = ref<'wav' | 'mp3'>('wav');
const bitrate = ref(192);
const loading = ref(false);
const error = ref('');

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  file.value = t.files?.[0] || null;
  audioUrl.value = file.value ? URL.createObjectURL(file.value) : '';
  outUrl.value = '';
  error.value = '';
}

async function convert() {
  error.value = '';
  outUrl.value = '';
  if (!file.value) {
    error.value = '请先选择音频';
    return;
  }
  loading.value = true;
  try {
    const ab = await file.value.arrayBuffer();
    const ctx = new AudioContext();
    const buffer = await ctx.decodeAudioData(ab.slice(0));
    if (format.value === 'wav') {
      outUrl.value = bufferToWavUrl(buffer);
    } else {
      outUrl.value = await bufferToMp3Url(buffer, bitrate.value || 192);
    }
  } catch (e: any) {
    error.value = e?.message || '转换失败';
  } finally {
    loading.value = false;
  }
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

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  let pos = 0;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][i]));
      sample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset + pos, sample | 0, true);
      pos += 2;
    }
  }
  const blob = new Blob([view], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

async function bufferToMp3Url(buffer: AudioBuffer, kbps: number) {
  // @ts-ignore
  const lamejs: any = await import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/lamejs@1.2.0/lame.min.js');
  const mp3Encoder = new (lamejs as any).Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, Math.max(64, Math.min(320, Math.floor(kbps))));
  const blockSize = 1152;
  const numCh = buffer.numberOfChannels;
  const samples = [];
  for (let ch = 0; ch < numCh; ch++) samples.push(buffer.getChannelData(ch));

  const mp3Data: Uint8Array[] = [];
  let i = 0;
  while (i < buffer.length) {
    const left = floatTo16(samples[0].subarray(i, i + blockSize));
    const right = numCh > 1 ? floatTo16(samples[1].subarray(i, i + blockSize)) : left;
    const enc: Uint8Array = mp3Encoder.encodeBuffer(left, right);
    if (enc.length > 0) mp3Data.push(enc);
    i += blockSize;
  }
  const encLast: Uint8Array = mp3Encoder.flush();
  if (encLast.length > 0) mp3Data.push(encLast);
  const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
}

function floatTo16(input: Float32Array) {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function download() {
  if (!outUrl.value) return;
  const a = document.createElement('a');
  a.href = outUrl.value;
  a.download = `audio.${format.value}`;
  a.click();
}
</script>
