<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">起点坐标</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">纬度 (Latitude)</label>
            <input v-model="startPoint.lat" type="number" step="any" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="例如: 39.9042" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">经度 (Longitude)</label>
            <input v-model="startPoint.lng" type="number" step="any" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="例如: 116.4074" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">地点名称 (可选)</label>
            <input v-model="startPoint.name" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="例如: 北京天安门" />
          </div>
        </div>

        <h3 class="font-medium text-lg">终点坐标</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">纬度 (Latitude)</label>
            <input v-model="endPoint.lat" type="number" step="any" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="例如: 31.2304" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">经度 (Longitude)</label>
            <input v-model="endPoint.lng" type="number" step="any" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="例如: 121.4737" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">地点名称 (可选)</label>
            <input v-model="endPoint.name" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="例如: 上海外滩" />
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="calculateDistance" :disabled="!canCalculate" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">计算距离</button>
          <button @click="loadExample" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">示例</button>
          <button @click="swapPoints" :disabled="!canCalculate" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换</button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">距离结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">直线距离 (大圆距离)</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">公里:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-lg">{{ result.kilometers.toFixed(2) }} km</span>
                  <button @click="copyToClipboard(`${result.kilometers.toFixed(2)} km`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">英里:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.miles.toFixed(2) }} mi</span>
                  <button @click="copyToClipboard(`${result.miles.toFixed(2)} mi`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">海里:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.nauticalMiles.toFixed(2) }} nmi</span>
                  <button @click="copyToClipboard(`${result.nauticalMiles.toFixed(2)} nmi`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">米:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.meters.toFixed(0) }} m</span>
                  <button @click="copyToClipboard(`${result.meters.toFixed(0)} m`)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">方位信息</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">初始方位角:</span>
                <span class="font-mono">{{ result.initialBearing.toFixed(1) }}°</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">最终方位角:</span>
                <span class="font-mono">{{ result.finalBearing.toFixed(1) }}°</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">方向:</span>
                <span class="font-medium">{{ getCompassDirection(result.initialBearing) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">中点坐标</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">纬度:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.midpoint.lat.toFixed(6) }}</span>
                  <button @click="copyToClipboard(result.midpoint.lat.toFixed(6))" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">经度:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono">{{ result.midpoint.lng.toFixed(6) }}</span>
                  <button @click="copyToClipboard(result.midpoint.lng.toFixed(6))" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">坐标对:</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm">{{ result.midpoint.lat.toFixed(6) }}, {{ result.midpoint.lng.toFixed(6) }}</span>
                  <button @click="copyToClipboard(`${result.midpoint.lat.toFixed(6)}, ${result.midpoint.lng.toFixed(6)}`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">
                    复制
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">旅行时间估算</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="font-medium mb-2">步行 (5 km/h)</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 5) }}</div>
              </div>
              <div>
                <div class="font-medium mb-2">自行车 (20 km/h)</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 20) }}</div>
              </div>
              <div>
                <div class="font-medium mb-2">汽车 (80 km/h)</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 80) }}</div>
              </div>
              <div>
                <div class="font-medium mb-2">飞机 (800 km/h)</div>
                <div class="text-gray-600 dark:text-gray-400">{{ formatTravelTime(result.kilometers / 800) }}</div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="viewOnMap" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">在地图中查看</button>
            <button @click="saveToHistory" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存记录</button>
            <button @click="exportResult" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md">导出结果</button>
          </div>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📏</div>
          <div class="text-lg mb-2">距离计算器</div>
          <div class="text-sm">输入两点坐标计算距离</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">计算历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">{{ item.startName || '起点' }} → {{ item.endName || '终点' }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="font-mono font-medium">{{ item.distance.toFixed(2) }} km</div>
              <div class="text-xs text-gray-500">{{ item.direction }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyToClipboard(`${item.distance.toFixed(2)} km`)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制距离</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">计算说明</h3>
      <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <div><strong>Haversine公式:</strong> 计算地球表面两点间的大圆距离</div>
        <div><strong>方位角:</strong> 从起点到终点的方向角度 (0°=北, 90°=东)</div>
        <div><strong>中点:</strong> 两点间大圆路径的中点坐标</div>
        <div><strong>注意:</strong> 结果为直线距离，实际路径可能更长</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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

function calculateDistance() {
  if (!canCalculate.value) return;

  const lat1 = parseFloat(startPoint.value.lat);
  const lng1 = parseFloat(startPoint.value.lng);
  const lat2 = parseFloat(endPoint.value.lat);
  const lng2 = parseFloat(endPoint.value.lng);

  // 验证坐标范围
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 || lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
    alert('坐标超出有效范围！纬度: -90° 到 90°，经度: -180° 到 180°');
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
  const directions = ['北', '北北东', '东北', '东北东', '东', '东南东', '东南', '南南东', '南', '南南西', '西南', '西南西', '西', '西北西', '西北', '北北西'];

  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

function formatTravelTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} 分钟`;
  } else if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
  } else {
    const days = Math.floor(hours / 24);
    const h = Math.round(hours % 24);
    return h > 0 ? `${days} 天 ${h} 小时` : `${days} 天`;
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
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板');
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
    startName: startPoint.value.name || '起点',
    endName: endPoint.value.name || '终点',
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
    起点: {
      坐标: `${startPoint.value.lat}, ${startPoint.value.lng}`,
      名称: startPoint.value.name || '未命名'
    },
    终点: {
      坐标: `${endPoint.value.lat}, ${endPoint.value.lng}`,
      名称: endPoint.value.name || '未命名'
    },
    距离: {
      公里: `${result.value.kilometers.toFixed(2)} km`,
      英里: `${result.value.miles.toFixed(2)} mi`,
      海里: `${result.value.nauticalMiles.toFixed(2)} nmi`,
      米: `${result.value.meters.toFixed(0)} m`
    },
    方位: {
      初始方位角: `${result.value.initialBearing.toFixed(1)}°`,
      最终方位角: `${result.value.finalBearing.toFixed(1)}°`,
      方向: getCompassDirection(result.value.initialBearing)
    },
    中点坐标: `${result.value.midpoint.lat.toFixed(6)}, ${result.value.midpoint.lng.toFixed(6)}`,
    计算时间: new Date().toLocaleString('zh-CN')
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `距离计算结果_${new Date().toISOString().slice(0, 10)}.json`;
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
