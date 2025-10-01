<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.geojson-viewer-editor.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.geojson-viewer-editor.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.geojson-viewer-editor.page.inputLabel') }}</label>
        <textarea
          v-model="raw"
          rows="12"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder='{"type":"FeatureCollection","features":[...]}'
        />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="validate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.geojson-viewer-editor.page.validate') }}</button>
      <button v-if="pretty" @click="copy" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.geojson-viewer-editor.page.copyPretty') }}</button>
    </div>

    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-red-700 dark:text-red-200 text-sm">{{ error }}</div>

    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.type }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.geojson-viewer-editor.page.stats.type') }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.features }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.geojson-viewer-editor.page.stats.features') }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.geometries }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.geojson-viewer-editor.page.stats.geometries') }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border">
        <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ stats.bounds }}</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.geojson-viewer-editor.page.stats.bounds') }}</div>
      </div>
    </div>

    <div v-if="pretty" class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.geojson-viewer-editor.page.prettyLabel') }}</div>
      <textarea readonly rows="12" class="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white">{{ pretty }}</textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const raw = ref('');
const pretty = ref('');
const { t } = useI18n();
const error = ref('');
const stats = ref<null | { type: string; features: number; geometries: number; bounds: string }>(null);

function validate() {
  error.value = '';
  pretty.value = '';
  stats.value = null;
  try {
    const json = JSON.parse(raw.value);
    if (!json || typeof json !== 'object') throw new Error(t('tools.geojson-viewer-editor.page.invalidJson'));
    const type = json.type || 'Unknown';
    let features = 0;
    let geometries = 0;
    const bounds = [Infinity, Infinity, -Infinity, -Infinity] as [number, number, number, number];

    function scanGeometry(g: any) {
      if (!g) return;
      geometries++;
      if (g.type === 'GeometryCollection' && Array.isArray(g.geometries)) {
        g.geometries.forEach(scanGeometry);
      } else {
        const coords = g.coordinates;
        visitCoords(coords);
      }
    }
    function visitCoords(c: any) {
      if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
        const [x, y] = c;
        bounds[0] = Math.min(bounds[0], x);
        bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x);
        bounds[3] = Math.max(bounds[3], y);
      } else if (Array.isArray(c)) {
        c.forEach(visitCoords);
      }
    }

    if (type === 'FeatureCollection' && Array.isArray(json.features)) {
      features = json.features.length;
      json.features.forEach((f: any) => scanGeometry(f.geometry));
    } else if (type === 'Feature' && json.geometry) {
      features = 1;
      scanGeometry(json.geometry);
    } else if (json.coordinates || json.type) {
      scanGeometry(json);
    }

    const bbox = bounds[0] === Infinity ? t('tools.geojson-viewer-editor.page.none') : `[${bounds[0].toFixed(4)}, ${bounds[1].toFixed(4)} ~ ${bounds[2].toFixed(4)}, ${bounds[3].toFixed(4)}]`;
    stats.value = { type, features, geometries, bounds: bbox };
    pretty.value = JSON.stringify(json, null, 2);
  } catch (e: any) {
    error.value = e?.message || t('tools.geojson-viewer-editor.page.parseFailed');
  }
}

async function copy() {
  if (!pretty.value) return;
  try {
    await navigator.clipboard.writeText(pretty.value);
    alert(t('tools.geojson-viewer-editor.page.copied'));
  } catch {
    alert(t('tools.geojson-viewer-editor.page.copyFailed'));
  }
}
</script>
