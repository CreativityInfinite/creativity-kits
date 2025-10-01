<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.distance-calculator.page.startTitle') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.distance-calculator.page.latLabel') }}</label>
            <input
              v-model="startPoint.lat"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.distance-calculator.page.latPlaceholder')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.distance-calculator.page.lngLabel') }}</label>
            <input
              v-model="startPoint.lng"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.distance-calculator.page.lngPlaceholder')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.distance-calculator.page.nameOptional') }}</label>
            <input
              v-model="startPoint.name"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.distance-calculator.page.namePlaceholderStart')"
            />
          </div>
        </div>

        <h3 class="font-medium text-lg">{{ $t('tools.distance-calculator.page.endTitle') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.distance-calculator.page.latLabel') }}</label>
            <input
              v-model="endPoint.lat"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.distance-calculator.page.endLatPlaceholder')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.distance-calculator.page.lngLabel') }}</label>
            <input
              v-model="endPoint.lng"
              type="number"
              step="any"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.distance-calculator.page.endLngPlaceholder')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.distance-calculator.page.nameOptional') }}</label>
            <input
              v-model="endPoint.name"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.distance-calculator.page.namePlaceholderEnd')"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="calculateDistance" :disabled="!canCalculate" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.distance-calculator.page.calculate') }}
          </button>
          <button @click="loadExample" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.distance-calculator.page.example') }}</button>
          <button @click="swapPoints" :disabled="!canCalculate" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.distance-calculator.page.swap') }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.distance-calculator.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.distance-calculator.page.distanceSectionTitle') }}</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.kmLabel') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-lg">{{ result.kilometers.toFixed(2) }} km</span>
                  <button @click="copyToClipboard(`${result.kilometers.toFixed(2)} km`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.miLabel') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.miles.toFixed(2) }} mi</span>
                  <button @click="copyToClipboard(`${result.miles.toFixed(2)} mi`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.nmiLabel') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.nauticalMiles.toFixed(2) }} nmi</span>
                  <button @click="copyToClipboard(`${result.nauticalMiles.toFixed(2)} nmi`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.mLabel') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.meters.toFixed(0) }} m</span>
                  <button @click="copyToClipboard(`${result.meters.toFixed(0)} m`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.distance-calculator.page.bearingSectionTitle') }}</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.initialBearing') }}</span>
                <span class="font-mono">{{ result.initialBearing.toFixed(1) }}°</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.finalBearing') }}</span>
                <span class="font-mono">{{ result.finalBearing.toFixed(1) }}°</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.direction') }}</span>
                <span class="font-medium">{{ getCompassDirection(result.initialBearing) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.distance-calculator.page.midpointSectionTitle') }}</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.midpointLat') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.midpoint.lat.toFixed(6) }}</span>
                  <button @click="copyToClipboard(result.midpoint.lat.toFixed(6))" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.midpointLng') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.midpoint.lng.toFixed(6) }}</span>
                  <button @click="copyToClipboard(result.midpoint.lng.toFixed(6))" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.distance-calculator.page.midpointPair') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm">{{ result.midpoint.lat.toFixed(6) }}, {{ result.midpoint.lng.toFixed(6) }}</span>
                  <button @click="copyToClipboard(`${result.midpoint.lat.toFixed(6)}, ${result.midpoint.lng.toFixed(6)}`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
                    {{ $t('tools.distance-calculator.page.copy') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.distance-calculator.page.travelSectionTitle') }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="font-medium mb-2">{{ $t('tools.distance-calculator.page.walkingLabel') }}</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 5) }}</div>
              </div>
              <div>
                <div class="font-medium mb-2">{{ $t('tools.distance-calculator.page.cyclingLabel') }}</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 20) }}</div>
              </div>
              <div>
                <div class="font-medium mb-2">{{ $t('tools.distance-calculator.page.drivingLabel') }}</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 80) }}</div>
              </div>
              <div>
                <div class="font-medium mb-2">{{ $t('tools.distance-calculator.page.flyingLabel') }}</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 800) }}</div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="viewOnMap" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.distance-calculator.page.viewOnMap') }}</button>
            <button @click="saveToHistory" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.distance-calculator.page.saveHistory') }}</button>
            <button @click="exportResult" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md">{{ $t('tools.distance-calculator.page.export') }}</button>
          </div>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📏</div>
          <div class="text-lg mb-2">{{ $t('tools.distance-calculator.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.distance-calculator.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.distance-calculator.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">{{ item.startName || $t('tools.distance-calculator.page.defaultStart') }} → {{ item.endName || $t('tools.distance-calculator.page.defaultEnd') }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="font-mono font-medium">{{ item.distance.toFixed(2) }} km</div>
              <div class="text-xs text-gray-500">{{ item.direction }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.distance-calculator.page.load') }}</button>
            <button @click="copyToClipboard(`${item.distance.toFixed(2)} km`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
              {{ $t('tools.distance-calculator.page.copyDistance') }}
            </button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.distance-calculator.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.distance-calculator.page.calcNoteTitle') }}</h3>
      <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <div>
          <strong>{{ $t('tools.distance-calculator.page.calcNoteHaversine') }}</strong>
        </div>
        <div>
          <strong>{{ $t('tools.distance-calculator.page.calcNoteBearing') }}</strong>
        </div>
        <div>
          <strong>{{ $t('tools.distance-calculator.page.calcNoteMidpoint') }}</strong>
        </div>
        <div>
          <strong>{{ $t('tools.distance-calculator.page.calcNoteNotice') }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface Point {
  lat: string;
  lng: string;
  name: string;
}

interface DistanceResult {
  kilometers: number;
  miles: number;
  nauticalMiles: number;
  meters: number;
  initialBearing: number;
  finalBearing: number;
  midpoint: {
    lat: number;
    lng: number;
  };
}

interface HistoryItem {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  startName: string;
  endName: string;
  distance: number;
  direction: string;
  timestamp: number;
}

const startPoint = ref<Point>({
  lat: '',
  lng: '',
  name: ''
});

const endPoint = ref<Point>({
  lat: '',
  lng: '',
  name: ''
});

const result = ref<DistanceResult | null>(null);
const history = ref<HistoryItem[]>([]);

const canCalculate = computed(() => {
  return startPoint.value.lat !== '' && startPoint.value.lng !== '' && endPoint.value.lat !== '' && endPoint.value.lng !== '';
});

const { t } = useI18n();
function calculateDistance() {
  if (!canCalculate.value) return;

  const lat1 = parseFloat(startPoint.value.lat);
  const lng1 = parseFloat(startPoint.value.lng);
  const lat2 = parseFloat(endPoint.value.lat);
  const lng2 = parseFloat(endPoint.value.lng);

  // 验证坐标范围
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 || lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
    alert(t('tools.distance-calculator.page.outOfRange'));
    return;
  }

  const distance = haversineDistance(lat1, lng1, lat2, lng2);
  const initialBearing = calculateBearing(lat1, lng1, lat2, lng2);
  const finalBearing = calculateBearing(lat2, lng2, lat1, lng1);
  const midpoint = calculateMidpoint(lat1, lng1, lat2, lng2);

  result.value = {
    kilometers: distance,
    miles: distance * 0.621371,
    nauticalMiles: distance * 0.539957,
    meters: distance * 1000,
    initialBearing: (initialBearing + 360) % 360,
    finalBearing: (finalBearing + 180) % 360,
    midpoint
  };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球半径 (公里)
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  return toDegrees(Math.atan2(y, x));
}

function calculateMidpoint(lat1: number, lng1: number, lat2: number, lng2: number): { lat: number; lng: number } {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const dLng = toRadians(lng2 - lng1);

  const Bx = Math.cos(lat2Rad) * Math.cos(dLng);
  const By = Math.cos(lat2Rad) * Math.sin(dLng);

  const lat3 = Math.atan2(Math.sin(lat1Rad) + Math.sin(lat2Rad), Math.sqrt((Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By));

  const lng3 = toRadians(lng1) + Math.atan2(By, Math.cos(lat1Rad) + Bx);

  return {
    lat: toDegrees(lat3),
    lng: toDegrees(lng3)
  };
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function getCompassDirection(bearing: number): string {
  const points = [
    t('tools.distance-calculator.page.compass.N'),
    t('tools.distance-calculator.page.compass.NNE'),
    t('tools.distance-calculator.page.compass.NE'),
    t('tools.distance-calculator.page.compass.ENE'),
    t('tools.distance-calculator.page.compass.E'),
    t('tools.distance-calculator.page.compass.ESE'),
    t('tools.distance-calculator.page.compass.SE'),
    t('tools.distance-calculator.page.compass.SSE'),
    t('tools.distance-calculator.page.compass.S'),
    t('tools.distance-calculator.page.compass.SSW'),
    t('tools.distance-calculator.page.compass.SW'),
    t('tools.distance-calculator.page.compass.WSW'),
    t('tools.distance-calculator.page.compass.W'),
    t('tools.distance-calculator.page.compass.WNW'),
    t('tools.distance-calculator.page.compass.NW'),
    t('tools.distance-calculator.page.compass.NNW')
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return points[index];
}

function formatTravelTime(hours: number): string {
  if (hours < 1) {
    const m = Math.round(hours * 60);
    return t('tools.distance-calculator.page.time.minutes', { m });
  } else if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? t('tools.distance-calculator.page.time.hoursMinutes', { h, m }) : t('tools.distance-calculator.page.time.hours', { h });
  } else {
    const d = Math.floor(hours / 24);
    const h = Math.round(hours % 24);
    return h > 0 ? t('tools.distance-calculator.page.time.daysHours', { d, h }) : t('tools.distance-calculator.page.time.days', { d });
  }
}

function loadExample() {
  startPoint.value = {
    lat: '39.9042',
    lng: '116.4074',
    name: '北京天安门'
  };
  endPoint.value = {
    lat: '31.2304',
    lng: '121.4737',
    name: '上海外滩'
  };
}

function swapPoints() {
  const temp = { ...startPoint.value };
  startPoint.value = { ...endPoint.value };
  endPoint.value = temp;
}

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert(t('tools.distance-calculator.page.copied'));
    })
    .catch(() => {
      alert(t('tools.distance-calculator.page.copyFailed'));
    });
}

function viewOnMap() {
  if (!result.value) return;

  const lat1 = parseFloat(startPoint.value.lat);
  const lng1 = parseFloat(startPoint.value.lng);
  const lat2 = parseFloat(endPoint.value.lat);
  const lng2 = parseFloat(endPoint.value.lng);

  // 计算地图中心点和缩放级别
  const centerLat = (lat1 + lat2) / 2;
  const centerLng = (lng1 + lng2) / 2;

  const url = `https://www.google.com/maps/dir/${lat1},${lng1}/${lat2},${lng2}/@${centerLat},${centerLng},8z`;
  window.open(url, '_blank');
}

function saveToHistory() {
  if (!result.value) return;

  const item: HistoryItem = {
    startLat: parseFloat(startPoint.value.lat),
    startLng: parseFloat(startPoint.value.lng),
    endLat: parseFloat(endPoint.value.lat),
    endLng: parseFloat(endPoint.value.lng),
    startName: startPoint.value.name || t('tools.distance-calculator.page.defaultStart'),
    endName: endPoint.value.name || t('tools.distance-calculator.page.defaultEnd'),
    distance: result.value.kilometers,
    direction: getCompassDirection(result.value.initialBearing),
    timestamp: Date.now()
  };

  // 避免重复
  const exists = history.value.some(
    (h) => Math.abs(h.startLat - item.startLat) < 0.0001 && Math.abs(h.startLng - item.startLng) < 0.0001 && Math.abs(h.endLat - item.endLat) < 0.0001 && Math.abs(h.endLng - item.endLng) < 0.0001
  );

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
  startPoint.value = {
    lat: item.startLat.toString(),
    lng: item.startLng.toString(),
    name: item.startName
  };
  endPoint.value = {
    lat: item.endLat.toString(),
    lng: item.endLng.toString(),
    name: item.endName
  };

  // 重新计算
  calculateDistance();
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  saveHistoryToStorage();
}

function exportResult() {
  if (!result.value) return;

  const data = {
    [t('tools.distance-calculator.page.exportStart')]: {
      [t('tools.distance-calculator.page.exportCoord')]: `${startPoint.value.lat}, ${startPoint.value.lng}`,
      [t('tools.distance-calculator.page.exportName')]: startPoint.value.name || t('tools.distance-calculator.page.exportUnnamed')
    },
    [t('tools.distance-calculator.page.exportEnd')]: {
      [t('tools.distance-calculator.page.exportCoord')]: `${endPoint.value.lat}, ${endPoint.value.lng}`,
      [t('tools.distance-calculator.page.exportName')]: endPoint.value.name || t('tools.distance-calculator.page.exportUnnamed')
    },
    [t('tools.distance-calculator.page.exportDistance')]: {
      [t('tools.distance-calculator.page.kmLabel')]: `${result.value.kilometers.toFixed(2)} km`,
      [t('tools.distance-calculator.page.miLabel')]: `${result.value.miles.toFixed(2)} mi`,
      [t('tools.distance-calculator.page.nmiLabel')]: `${result.value.nauticalMiles.toFixed(2)} nmi`,
      [t('tools.distance-calculator.page.mLabel')]: `${result.value.meters.toFixed(0)} m`
    },
    [t('tools.distance-calculator.page.exportBearing')]: {
      [t('tools.distance-calculator.page.initialBearing')]: `${result.value.initialBearing.toFixed(1)}°`,
      [t('tools.distance-calculator.page.finalBearing')]: `${result.value.finalBearing.toFixed(1)}°`,
      [t('tools.distance-calculator.page.direction')]: getCompassDirection(result.value.initialBearing)
    },
    [t('tools.distance-calculator.page.exportMidpoint')]: `${result.value.midpoint.lat.toFixed(6)}, ${result.value.midpoint.lng.toFixed(6)}`,
    [t('tools.distance-calculator.page.exportTime')]: new Date().toLocaleString('zh-CN')
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${t('tools.distance-calculator.page.exportFileNamePrefix')}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function saveHistoryToStorage() {
  localStorage.setItem('distance-history', JSON.stringify(history.value));
}

function loadHistoryFromStorage() {
  const saved = localStorage.getItem('distance-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }
}

onMounted(() => {
  loadHistoryFromStorage();
});
</script>
