<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.coordinates-converter.page.inputTitle') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.coordinates-converter.page.inputFormat') }}</label>
            <select v-model="inputFormat" @change="clearInputs" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="decimal">{{ $t('tools.coordinates-converter.page.decimal') }}</option>
              <option value="dms">{{ $t('tools.coordinates-converter.page.dms') }}</option>
              <option value="dm">{{ $t('tools.coordinates-converter.page.dm') }}</option>
            </select>
          </div>

          <div v-if="inputFormat === 'decimal'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.coordinates-converter.page.latLabel') }}</label>
              <input
                v-model="decimal.lat"
                type="number"
                step="any"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="$t('tools.coordinates-converter.page.latPlaceholder')"
              />
              <p class="text-xs text-gray-500 mt-1">{{ $t('tools.coordinates-converter.page.latRange') }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.coordinates-converter.page.lngLabel') }}</label>
              <input
                v-model="decimal.lng"
                type="number"
                step="any"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="$t('tools.coordinates-converter.page.lngPlaceholder')"
              />
              <p class="text-xs text-gray-500 mt-1">{{ $t('tools.coordinates-converter.page.lngRange') }}</p>
            </div>
          </div>

          <div v-if="inputFormat === 'dms'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.coordinates-converter.page.latDmsLabel') }}</label>
              <div class="grid grid-cols-4 gap-2">
                <input
                  v-model="dms.lat.degrees"
                  type="number"
                  min="0"
                  max="90"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.deg')"
                />
                <input
                  v-model="dms.lat.minutes"
                  type="number"
                  min="0"
                  max="59"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.min')"
                />
                <input
                  v-model="dms.lat.seconds"
                  type="number"
                  min="0"
                  max="59.999"
                  step="any"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.sec')"
                />
                <select v-model="dms.lat.direction" class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="N">N</option>
                  <option value="S">S</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.coordinates-converter.page.lngDmsLabel') }}</label>
              <div class="grid grid-cols-4 gap-2">
                <input
                  v-model="dms.lng.degrees"
                  type="number"
                  min="0"
                  max="180"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.deg')"
                />
                <input
                  v-model="dms.lng.minutes"
                  type="number"
                  min="0"
                  max="59"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.min')"
                />
                <input
                  v-model="dms.lng.seconds"
                  type="number"
                  min="0"
                  max="59.999"
                  step="any"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.sec')"
                />
                <select v-model="dms.lng.direction" class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="E">E</option>
                  <option value="W">W</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="inputFormat === 'dm'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.coordinates-converter.page.latDmLabel') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <input
                  v-model="dm.lat.degrees"
                  type="number"
                  min="0"
                  max="90"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.deg')"
                />
                <input
                  v-model="dm.lat.minutes"
                  type="number"
                  min="0"
                  max="59.999"
                  step="any"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.min')"
                />
                <select v-model="dm.lat.direction" class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="N">N</option>
                  <option value="S">S</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.coordinates-converter.page.lngDmLabel') }}</label>
              <div class="grid grid-cols-3 gap-2">
                <input
                  v-model="dm.lng.degrees"
                  type="number"
                  min="0"
                  max="180"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.deg')"
                />
                <input
                  v-model="dm.lng.minutes"
                  type="number"
                  min="0"
                  max="59.999"
                  step="any"
                  class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  :placeholder="$t('tools.coordinates-converter.page.min')"
                />
                <select v-model="dm.lng.direction" class="px-2 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="E">E</option>
                  <option value="W">W</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="convert" :disabled="!canConvert" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.coordinates-converter.page.convert') }}
            </button>
            <button @click="loadExample" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.coordinates-converter.page.example') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">{{ $t('tools.coordinates-converter.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.coordinates-converter.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.coordinates-converter.page.resultDD') }}</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.resultLat') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.decimal.lat }}</span>
                  <button @click="copyToClipboard(result.decimal.lat.toString())" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.resultLng') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.decimal.lng }}</span>
                  <button @click="copyToClipboard(result.decimal.lng.toString())" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.resultPair') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.decimal.lat }}, {{ result.decimal.lng }}</span>
                  <button @click="copyToClipboard(`${result.decimal.lat}, ${result.decimal.lng}`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.coordinates-converter.page.dms') }}</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.resultLat') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ formatDMS(result.dms.lat) }}</span>
                  <button @click="copyToClipboard(formatDMS(result.dms.lat))" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.resultLng') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ formatDMS(result.dms.lng) }}</span>
                  <button @click="copyToClipboard(formatDMS(result.dms.lng))" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.coordinates-converter.page.dm') }}</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">纬度:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ formatDM(result.dm.lat) }}</span>
                  <button @click="copyToClipboard(formatDM(result.dm.lat))" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">经度:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ formatDM(result.dm.lng) }}</span>
                  <button @click="copyToClipboard(formatDM(result.dm.lng))" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.coordinates-converter.page.otherFormats') }}</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.googleMaps') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs">{{ result.decimal.lat }},{{ result.decimal.lng }}</span>
                  <button @click="copyToClipboard(`${result.decimal.lat},${result.decimal.lng}`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.geojson') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs">[{{ result.decimal.lng }}, {{ result.decimal.lat }}]</span>
                  <button @click="copyToClipboard(`[${result.decimal.lng}, ${result.decimal.lat}]`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.coordinates-converter.page.wktPoint') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs">POINT({{ result.decimal.lng }} {{ result.decimal.lat }})</span>
                  <button @click="copyToClipboard(`POINT(${result.decimal.lng} ${result.decimal.lat})`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.coordinates-converter.page.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="openInMaps" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.coordinates-converter.page.viewInMaps') }}</button>
            <button @click="saveToHistory" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.coordinates-converter.page.saveToHistory') }}</button>
          </div>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🗺️</div>
          <div class="text-lg mb-2">{{ $t('tools.coordinates-converter.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.coordinates-converter.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.coordinates-converter.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div class="font-mono">{{ item.decimal.lat }}, {{ item.decimal.lng }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.coordinates-converter.page.load') }}</button>
            <button @click="copyToClipboard(`${item.decimal.lat}, ${item.decimal.lng}`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
              {{ $t('tools.coordinates-converter.page.copy') }}
            </button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.coordinates-converter.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.coordinates-converter.page.specsTitle') }}</h3>
      <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <div>
          <strong>{{ $t('tools.coordinates-converter.page.specDD') }}</strong> 39.9042, 116.4074
        </div>
        <div>
          <strong>{{ $t('tools.coordinates-converter.page.specDMS') }}</strong> 39°54'15.12"N, 116°24'26.64"E
        </div>
        <div>
          <strong>{{ $t('tools.coordinates-converter.page.specDM') }}</strong> 39°54.252'N, 116°24.444'E
        </div>
        <div>
          <strong>{{ $t('tools.coordinates-converter.page.note') }}</strong> {{ $t('tools.coordinates-converter.page.noteRange') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface DMSCoordinate {
  degrees: number;
  minutes: number;
  seconds: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

interface DMCoordinate {
  degrees: number;
  minutes: number;
  direction: 'N' | 'S' | 'E' | 'W';
}

interface ConversionResult {
  decimal: {
    lat: number;
    lng: number;
  };
  dms: {
    lat: DMSCoordinate;
    lng: DMSCoordinate;
  };
  dm: {
    lat: DMCoordinate;
    lng: DMCoordinate;
  };
}

interface HistoryItem extends ConversionResult {
  timestamp: number;
}

const inputFormat = ref<'decimal' | 'dms' | 'dm'>('decimal');
const result = ref<ConversionResult | null>(null);
const history = ref<HistoryItem[]>([]);

const decimal = ref({
  lat: '',
  lng: ''
});

const dms = ref({
  lat: {
    degrees: 0,
    minutes: 0,
    seconds: 0,
    direction: 'N' as const
  },
  lng: {
    degrees: 0,
    minutes: 0,
    seconds: 0,
    direction: 'E' as const
  }
});

const dm = ref({
  lat: {
    degrees: 0,
    minutes: 0,
    direction: 'N' as const
  },
  lng: {
    degrees: 0,
    minutes: 0,
    direction: 'E' as const
  }
});

const canConvert = computed(() => {
  if (inputFormat.value === 'decimal') {
    return decimal.value.lat !== '' && decimal.value.lng !== '';
  } else if (inputFormat.value === 'dms') {
    return dms.value.lat.degrees !== null && dms.value.lng.degrees !== null;
  } else if (inputFormat.value === 'dm') {
    return dm.value.lat.degrees !== null && dm.value.lng.degrees !== null;
  }
  return false;
});

function convert() {
  if (!canConvert.value) return;

  let lat: number, lng: number;

  if (inputFormat.value === 'decimal') {
    lat = parseFloat(decimal.value.lat);
    lng = parseFloat(decimal.value.lng);
  } else if (inputFormat.value === 'dms') {
    lat = dmsToDecimal(dms.value.lat);
    lng = dmsToDecimal(dms.value.lng);
  } else {
    lat = dmToDecimal(dm.value.lat);
    lng = dmToDecimal(dm.value.lng);
  }

  // 验证坐标范围
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    alert(t('tools.coordinates-converter.page.alertRange'));
    return;
  }

  result.value = {
    decimal: {
      lat: Math.round(lat * 1000000) / 1000000,
      lng: Math.round(lng * 1000000) / 1000000
    },
    dms: {
      lat: decimalToDMS(lat, 'lat'),
      lng: decimalToDMS(lng, 'lng')
    },
    dm: {
      lat: decimalToDM(lat, 'lat'),
      lng: decimalToDM(lng, 'lng')
    }
  };
}

function dmsToDecimal(coord: DMSCoordinate): number {
  let decimal = coord.degrees + coord.minutes / 60 + coord.seconds / 3600;
  if (coord.direction === 'S' || coord.direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
}

function dmToDecimal(coord: DMCoordinate): number {
  let decimal = coord.degrees + coord.minutes / 60;
  if (coord.direction === 'S' || coord.direction === 'W') {
    decimal = -decimal;
  }
  return decimal;
}

function decimalToDMS(decimal: number, type: 'lat' | 'lng'): DMSCoordinate {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = Math.round((minutesFloat - minutes) * 60 * 1000) / 1000;

  let direction: 'N' | 'S' | 'E' | 'W';
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return { degrees, minutes, seconds, direction };
}

function decimalToDM(decimal: number, type: 'lat' | 'lng'): DMCoordinate {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutes = Math.round((abs - degrees) * 60 * 1000) / 1000;

  let direction: 'N' | 'S' | 'E' | 'W';
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S';
  } else {
    direction = decimal >= 0 ? 'E' : 'W';
  }

  return { degrees, minutes, direction };
}

function formatDMS(coord: DMSCoordinate): string {
  return `${coord.degrees}°${coord.minutes}'${coord.seconds}"${coord.direction}`;
}

function formatDM(coord: DMCoordinate): string {
  return `${coord.degrees}°${coord.minutes}'${coord.direction}`;
}

function clearInputs() {
  decimal.value = { lat: '', lng: '' };
  dms.value = {
    lat: { degrees: 0, minutes: 0, seconds: 0, direction: 'N' },
    lng: { degrees: 0, minutes: 0, seconds: 0, direction: 'E' }
  };
  dm.value = {
    lat: { degrees: 0, minutes: 0, direction: 'N' },
    lng: { degrees: 0, minutes: 0, direction: 'E' }
  };
}

function clearAll() {
  clearInputs();
  result.value = null;
}

function loadExample() {
  const examples = {
    decimal: { lat: '39.9042', lng: '116.4074' }, // 北京天安门
    dms: {
      lat: { degrees: 39, minutes: 54, seconds: 15.12, direction: 'N' as const },
      lng: { degrees: 116, minutes: 24, seconds: 26.64, direction: 'E' as const }
    },
    dm: {
      lat: { degrees: 39, minutes: 54.252, direction: 'N' as const },
      lng: { degrees: 116, minutes: 24.444, direction: 'E' as const }
    }
  };

  if (inputFormat.value === 'decimal') {
    decimal.value = examples.decimal;
  } else if (inputFormat.value === 'dms') {
    dms.value = examples.dms;
  } else {
    dm.value = examples.dm;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert(t('tools.coordinates-converter.page.copied'));
  });
}

function openInMaps() {
  if (!result.value) return;

  const { lat, lng } = result.value.decimal;
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, '_blank');
}

function saveToHistory() {
  if (!result.value) return;

  const item: HistoryItem = {
    ...result.value,
    timestamp: Date.now()
  };

  // 避免重复
  const exists = history.value.some((h) => Math.abs(h.decimal.lat - item.decimal.lat) < 0.000001 && Math.abs(h.decimal.lng - item.decimal.lng) < 0.000001);

  if (!exists) {
    history.value.unshift(item);

    // 只保留最近20条
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20);
    }

    saveHistoryToStorage();
  }
}

function loadFromHistory(item: HistoryItem) {
  result.value = {
    decimal: item.decimal,
    dms: item.dms,
    dm: item.dm
  };

  // 同时更新输入框
  decimal.value = {
    lat: item.decimal.lat.toString(),
    lng: item.decimal.lng.toString()
  };
  inputFormat.value = 'decimal';
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  saveHistoryToStorage();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function saveHistoryToStorage() {
  localStorage.setItem('coordinates-history', JSON.stringify(history.value));
}

function loadHistoryFromStorage() {
  const saved = localStorage.getItem('coordinates-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch (error) {
      console.error(t('tools.coordinates-converter.page.loadHistoryFailed'), error);
    }
  }
}

onMounted(() => {
  loadHistoryFromStorage();
});
</script>
