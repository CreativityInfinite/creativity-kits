<template>
  <div class="space-y-4">
    <h3 class="font-medium text-lg">{{ $t('tools.file-drop-inspector.page.title') }}</h3>

    <div class="border-2 border-dashed rounded-lg p-8 text-center dark:border-gray-600" @dragover.prevent @drop.prevent="onDrop">
      <div class="text-4xl mb-2">📦</div>
      <div class="text-gray-600 dark:text-gray-300">{{ $t('tools.file-drop-inspector.page.dropOrClick') }}</div>
      <div class="mt-3">
        <input type="file" multiple @change="onChoose" />
      </div>
    </div>

    <div v-if="items.length" class="space-y-3">
      <div v-for="(it, i) in items" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div class="font-medium">{{ it.name }}</div>
        <div class="text-xs text-gray-500 mb-2">
          {{ $t('tools.file-drop-inspector.page.sizeLabel') }} {{ it.size }} | {{ $t('tools.file-drop-inspector.page.typeLabel') }} {{ it.type || $t('tools.file-drop-inspector.page.unknown') }} |
          {{ $t('tools.file-drop-inspector.page.lastModifiedLabel') }} {{ formatDate(it.lastModified) }}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium mb-1">{{ $t('tools.file-drop-inspector.page.head64Hex') }}</div>
            <pre class="text-xs bg-white dark:bg-gray-900 rounded p-2 overflow-auto">{{ it.headHex }}</pre>
          </div>
          <div>
            <div class="text-sm font-medium mb-1">{{ $t('tools.file-drop-inspector.page.previewAndSize') }}</div>
            <div v-if="it.previewUrl">
              <img :src="it.previewUrl" class="max-h-64 rounded border dark:border-gray-700" alt="preview" />
              <div class="text-xs text-gray-500 mt-1">{{ $t('tools.file-drop-inspector.page.size') }} {{ it.width }}x{{ it.height }}</div>
            </div>
            <div v-else class="text-xs text-gray-500">{{ $t('tools.file-drop-inspector.page.notImageOrNoPreview') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
      <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

type Item = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  headHex: string;
  previewUrl: string | null;
  width: number | null;
  height: number | null;
};

const items = ref<Item[]>([]);
const error = ref('');

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

async function readHeadHex(f: File) {
  const buf = await f.slice(0, 64).arrayBuffer();
  const bytes = new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}

function tryImagePreview(f: File): Promise<{ url: string | null; width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    if (!f.type.startsWith('image/')) return resolve({ url: null, width: null, height: null });
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ url: null, width: null, height: null });
    img.src = url;
  });
}

const { t } = useI18n();

async function handleFiles(fl: FileList | null) {
  if (!fl) return;
  error.value = '';
  const list: Item[] = [];
  for (const f of Array.from(fl)) {
    try {
      const headHex = await readHeadHex(f);
      const prev = await tryImagePreview(f);
      list.push({ name: f.name, size: f.size, type: f.type, lastModified: f.lastModified, headHex, previewUrl: prev.url, width: prev.width, height: prev.height });
    } catch (e: any) {
      error.value = e?.message || t('tools.file-drop-inspector.page.parseFailed');
    }
  }
  items.value = list;
}

function onDrop(e: DragEvent) {
  handleFiles(e.dataTransfer?.files || null);
}
function onChoose(e: Event) {
  handleFiles((e.target as HTMLInputElement).files);
}
</script>
