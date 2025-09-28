<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">颜色选择器</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">主颜色</h4>
            <div class="flex gap-2">
              <button @click="randomColor" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">随机颜色</button>
              <button @click="resetColor" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">重置</button>
            </div>
          </div>

          <div class="space-y-4">
            <!-- 颜色预览 -->
            <div class="relative">
              <div
                class="w-full h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                :style="{ backgroundColor: currentColor.hex }"
                @click="showColorPicker = !showColorPicker"
              >
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm font-mono">
                    {{ currentColor.hex }}
                  </div>
                </div>
              </div>

              <!-- HTML5 颜色选择器 -->
              <input v-model="htmlColorInput" type="color" class="absolute top-2 right-2 w-8 h-8 border-0 rounded cursor-pointer" @input="updateFromHtmlColor" />
            </div>

            <!-- HSL 滑块 -->
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1"> 色相 (H): {{ Math.round(currentColor.hsl.h) }}° </label>
                <input
                  v-model.number="currentColor.hsl.h"
                  type="range"
                  min="0"
                  max="360"
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  :style="{ background: hueGradient }"
                  @input="updateFromHSL"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"> 饱和度 (S): {{ Math.round(currentColor.hsl.s) }}% </label>
                <input
                  v-model.number="currentColor.hsl.s"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  :style="{ background: saturationGradient }"
                  @input="updateFromHSL"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"> 亮度 (L): {{ Math.round(currentColor.hsl.l) }}% </label>
                <input
                  v-model.number="currentColor.hsl.l"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  :style="{ background: lightnessGradient }"
                  @input="updateFromHSL"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-1"> 透明度 (A): {{ Math.round(currentColor.alpha * 100) }}% </label>
                <input
                  v-model.number="currentColor.alpha"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  :style="{ background: alphaGradient }"
                  @input="updateFromAlpha"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">颜色格式</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-4 gap-2 text-sm">
              <label class="font-medium">HEX:</label>
              <input
                v-model="colorInputs.hex"
                type="text"
                class="col-span-3 px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="updateFromInput('hex')"
                @blur="validateInput('hex')"
              />

              <label class="font-medium">RGB:</label>
              <div class="col-span-3 grid grid-cols-3 gap-1">
                <input
                  v-model.number="colorInputs.rgb.r"
                  type="number"
                  min="0"
                  max="255"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('rgb')"
                />
                <input
                  v-model.number="colorInputs.rgb.g"
                  type="number"
                  min="0"
                  max="255"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('rgb')"
                />
                <input
                  v-model.number="colorInputs.rgb.b"
                  type="number"
                  min="0"
                  max="255"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('rgb')"
                />
              </div>

              <label class="font-medium">HSL:</label>
              <div class="col-span-3 grid grid-cols-3 gap-1">
                <input
                  v-model.number="colorInputs.hsl.h"
                  type="number"
                  min="0"
                  max="360"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('hsl')"
                />
                <input
                  v-model.number="colorInputs.hsl.s"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('hsl')"
                />
                <input
                  v-model.number="colorInputs.hsl.l"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('hsl')"
                />
              </div>

              <label class="font-medium">HSV:</label>
              <div class="col-span-3 grid grid-cols-3 gap-1">
                <input
                  v-model.number="colorInputs.hsv.h"
                  type="number"
                  min="0"
                  max="360"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('hsv')"
                />
                <input
                  v-model.number="colorInputs.hsv.s"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('hsv')"
                />
                <input
                  v-model.number="colorInputs.hsv.v"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('hsv')"
                />
              </div>

              <label class="font-medium">CMYK:</label>
              <div class="col-span-3 grid grid-cols-4 gap-1">
                <input
                  v-model.number="colorInputs.cmyk.c"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('cmyk')"
                />
                <input
                  v-model.number="colorInputs.cmyk.m"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('cmyk')"
                />
                <input
                  v-model.number="colorInputs.cmyk.y"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('cmyk')"
                />
                <input
                  v-model.number="colorInputs.cmyk.k"
                  type="number"
                  min="0"
                  max="100"
                  class="px-2 py-1 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  @input="updateFromInput('cmyk')"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">CSS 格式</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-mono">{{ cssFormats.hex }}</span>
              <button @click="copyText(cssFormats.hex)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-mono">{{ cssFormats.rgb }}</span>
              <button @click="copyText(cssFormats.rgb)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-mono">{{ cssFormats.rgba }}</span>
              <button @click="copyText(cssFormats.rgba)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-mono">{{ cssFormats.hsl }}</span>
              <button @click="copyText(cssFormats.hsl)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-mono">{{ cssFormats.hsla }}</span>
              <button @click="copyText(cssFormats.hsla)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">预设颜色</h4>
          <div class="grid grid-cols-8 gap-2">
            <div
              v-for="preset in presetColors"
              :key="preset"
              class="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
              :style="{ backgroundColor: preset }"
              @click="setColor(preset)"
            ></div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">颜色分析</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">颜色信息</h4>
          </div>
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">亮度</div>
                <div class="font-mono">{{ colorAnalysis.brightness.toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-gray-500">对比度 (vs 白色)</div>
                <div class="font-mono">{{ colorAnalysis.contrastWhite.toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-gray-500">对比度 (vs 黑色)</div>
                <div class="font-mono">{{ colorAnalysis.contrastBlack.toFixed(2) }}</div>
              </div>
              <div>
                <div class="text-gray-500">色温</div>
                <div class="font-mono">{{ colorAnalysis.temperature }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="text-sm font-medium">WCAG 可访问性</div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span>AA 正常文本</span>
                  <span :class="colorAnalysis.wcag.aa.normal ? 'text-green-500' : 'text-red-500'">
                    {{ colorAnalysis.wcag.aa.normal ? '✓' : '✗' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span>AA 大文本</span>
                  <span :class="colorAnalysis.wcag.aa.large ? 'text-green-500' : 'text-red-500'">
                    {{ colorAnalysis.wcag.aa.large ? '✓' : '✗' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span>AAA 正常文本</span>
                  <span :class="colorAnalysis.wcag.aaa.normal ? 'text-green-500' : 'text-red-500'">
                    {{ colorAnalysis.wcag.aaa.normal ? '✓' : '✗' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span>AAA 大文本</span>
                  <span :class="colorAnalysis.wcag.aaa.large ? 'text-green-500' : 'text-red-500'">
                    {{ colorAnalysis.wcag.aaa.large ? '✓' : '✗' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">调色板生成</h4>
          </div>
          <div class="p-4 space-y-4">
            <div class="flex gap-2">
              <button @click="generatePalette('monochromatic')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">单色</button>
              <button @click="generatePalette('analogous')" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">类似色</button>
              <button @click="generatePalette('complementary')" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">互补色</button>
              <button @click="generatePalette('triadic')" class="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">三角色</button>
            </div>

            <div v-if="generatedPalette.length > 0" class="space-y-3">
              <div class="text-sm font-medium">{{ paletteType }} 调色板</div>
              <div class="grid grid-cols-5 gap-2">
                <div v-for="(color, index) in generatedPalette" :key="index" class="space-y-1">
                  <div class="w-full h-16 rounded border cursor-pointer hover:scale-105 transition-transform" :style="{ backgroundColor: color }" @click="setColor(color)"></div>
                  <div class="text-xs font-mono text-center">{{ color }}</div>
                  <button @click="copyText(color)" class="w-full px-1 py-0.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">颜色变化</h4>
          </div>
          <div class="p-4 space-y-4">
            <div class="space-y-2">
              <div class="text-sm font-medium">亮度变化</div>
              <div class="grid grid-cols-9 gap-1">
                <div v-for="(shade, index) in colorShades" :key="index" class="space-y-1">
                  <div class="w-full h-12 rounded border cursor-pointer hover:scale-105 transition-transform" :style="{ backgroundColor: shade }" @click="setColor(shade)"></div>
                  <div class="text-xs text-center">{{ (index + 1) * 10 }}%</div>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="text-sm font-medium">饱和度变化</div>
              <div class="grid grid-cols-9 gap-1">
                <div v-for="(tint, index) in colorTints" :key="index" class="space-y-1">
                  <div class="w-full h-12 rounded border cursor-pointer hover:scale-105 transition-transform" :style="{ backgroundColor: tint }" @click="setColor(tint)"></div>
                  <div class="text-xs text-center">{{ (index + 1) * 10 }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">颜色历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="colorHistory.length > 0" class="grid grid-cols-8 gap-2">
              <div v-for="(historyColor, index) in colorHistory.slice(0, 16)" :key="index" class="space-y-1">
                <div class="w-full h-8 rounded border cursor-pointer hover:scale-110 transition-transform" :style="{ backgroundColor: historyColor }" @click="setColor(historyColor)"></div>
                <div class="text-xs font-mono text-center truncate">{{ historyColor }}</div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无颜色历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">颜色选择</h4>
          <ul class="space-y-1">
            <li>• 点击颜色预览区域选择颜色</li>
            <li>• 使用 HSL 滑块精确调整</li>
            <li>• 直接输入各种格式的颜色值</li>
            <li>• 点击预设颜色快速选择</li>
            <li>• 支持透明度调整</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">颜色格式</h4>
          <ul class="space-y-1">
            <li>• HEX: 网页常用格式</li>
            <li>• RGB: 红绿蓝三原色</li>
            <li>• HSL: 色相饱和度亮度</li>
            <li>• HSV: 色相饱和度明度</li>
            <li>• CMYK: 印刷四色模式</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">实用功能</h4>
          <ul class="space-y-1">
            <li>• 自动生成配色方案</li>
            <li>• WCAG 可访问性检查</li>
            <li>• 颜色对比度分析</li>
            <li>• 亮度和饱和度变化</li>
            <li>• 颜色历史记录</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

interface Color {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  cmyk: CMYK;
  alpha: number;
}

interface ColorAnalysis {
  brightness: number;
  contrastWhite: number;
  contrastBlack: number;
  temperature: string;
  wcag: {
    aa: { normal: boolean; large: boolean };
    aaa: { normal: boolean; large: boolean };
  };
}

const currentColor = ref<Color>({
  hex: '#3B82F6',
  rgb: { r: 59, g: 130, b: 246 },
  hsl: { h: 217, s: 91, l: 60 },
  hsv: { h: 217, s: 76, v: 96 },
  cmyk: { c: 76, m: 47, y: 0, k: 4 },
  alpha: 1
});

const colorInputs = ref<Color>({
  hex: '#3B82F6',
  rgb: { r: 59, g: 130, b: 246 },
  hsl: { h: 217, s: 91, l: 60 },
  hsv: { h: 217, s: 76, v: 96 },
  cmyk: { c: 76, m: 47, y: 0, k: 4 },
  alpha: 1
});

const htmlColorInput = ref('#3B82F6');
const showColorPicker = ref(false);
const generatedPalette = ref<string[]>([]);
const paletteType = ref('');
const colorHistory = ref<string[]>([]);

const presetColors = [
  '#FF0000',
  '#FF8000',
  '#FFFF00',
  '#80FF00',
  '#00FF00',
  '#00FF80',
  '#00FFFF',
  '#0080FF',
  '#0000FF',
  '#8000FF',
  '#FF00FF',
  '#FF0080',
  '#800000',
  '#804000',
  '#808000',
  '#408000',
  '#008000',
  '#008040',
  '#008080',
  '#004080',
  '#000080',
  '#400080',
  '#800080',
  '#800040',
  '#000000',
  '#404040',
  '#808080',
  '#C0C0C0',
  '#FFFFFF',
  '#FFE0E0',
  '#E0FFE0',
  '#E0E0FF'
];

// 计算属性
const hueGradient = computed(() => {
  return 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';
});

const saturationGradient = computed(() => {
  const baseColor = hslToHex(currentColor.value.hsl.h, 0, currentColor.value.hsl.l);
  const fullColor = hslToHex(currentColor.value.hsl.h, 100, currentColor.value.hsl.l);
  return `linear-gradient(to right, ${baseColor}, ${fullColor})`;
});

const lightnessGradient = computed(() => {
  const darkColor = hslToHex(currentColor.value.hsl.h, currentColor.value.hsl.s, 0);
  const midColor = hslToHex(currentColor.value.hsl.h, currentColor.value.hsl.s, 50);
  const lightColor = hslToHex(currentColor.value.hsl.h, currentColor.value.hsl.s, 100);
  return `linear-gradient(to right, ${darkColor}, ${midColor}, ${lightColor})`;
});

const alphaGradient = computed(() => {
  const transparentColor = `rgba(${currentColor.value.rgb.r}, ${currentColor.value.rgb.g}, ${currentColor.value.rgb.b}, 0)`;
  const opaqueColor = `rgba(${currentColor.value.rgb.r}, ${currentColor.value.rgb.g}, ${currentColor.value.rgb.b}, 1)`;
  return `linear-gradient(to right, ${transparentColor}, ${opaqueColor})`;
});

const cssFormats = computed(() => {
  const { rgb, hsl, alpha } = currentColor.value;
  return {
    hex: currentColor.value.hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    hsla: `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${alpha})`
  };
});

const colorAnalysis = computed((): ColorAnalysis => {
  const { rgb } = currentColor.value;

  // 计算相对亮度
  const brightness = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // 计算对比度
  const contrastWhite = (brightness + 0.05) / (1 + 0.05);
  const contrastBlack = (1 + 0.05) / (brightness + 0.05);

  // 估算色温
  let temperature = '中性';
  if (rgb.r > rgb.b + 30) temperature = '暖色';
  else if (rgb.b > rgb.r + 30) temperature = '冷色';

  // WCAG 可访问性检查
  const wcag = {
    aa: {
      normal: contrastBlack >= 4.5 || contrastWhite >= 4.5,
      large: contrastBlack >= 3 || contrastWhite >= 3
    },
    aaa: {
      normal: contrastBlack >= 7 || contrastWhite >= 7,
      large: contrastBlack >= 4.5 || contrastWhite >= 4.5
    }
  };

  return {
    brightness,
    contrastWhite,
    contrastBlack,
    temperature,
    wcag
  };
});

const colorShades = computed(() => {
  const shades: string[] = [];
  for (let i = 1; i <= 9; i++) {
    const lightness = i * 10;
    shades.push(hslToHex(currentColor.value.hsl.h, currentColor.value.hsl.s, lightness));
  }
  return shades;
});

const colorTints = computed(() => {
  const tints: string[] = [];
  for (let i = 1; i <= 9; i++) {
    const saturation = i * 10;
    tints.push(hslToHex(currentColor.value.hsl.h, saturation, currentColor.value.hsl.l));
  }
  return tints;
});

onMounted(() => {
  loadColorHistory();
  updateColorInputs();
});

// 颜色转换函数
function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function rgbToCmyk(r: number, g: number, b: number): CMYK {
  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
}

// 更新颜色
function updateColor(newColor: Partial<Color>) {
  let rgb: RGB;

  if (newColor.hex) {
    rgb = hexToRgb(newColor.hex);
  } else if (newColor.rgb) {
    rgb = newColor.rgb;
  } else if (newColor.hsl) {
    rgb = hslToRgb(newColor.hsl.h, newColor.hsl.s, newColor.hsl.l);
  } else if (newColor.hsv) {
    // HSV to RGB conversion
    const { h, s, v } = newColor.hsv;
    const c = (v * s) / 10000;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v / 100 - c;

    let r1 = 0,
      g1 = 0,
      b1 = 0;

    if (h >= 0 && h < 60) {
      r1 = c;
      g1 = x;
      b1 = 0;
    } else if (h >= 60 && h < 120) {
      r1 = x;
      g1 = c;
      b1 = 0;
    } else if (h >= 120 && h < 180) {
      r1 = 0;
      g1 = c;
      b1 = x;
    } else if (h >= 180 && h < 240) {
      r1 = 0;
      g1 = x;
      b1 = c;
    } else if (h >= 240 && h < 300) {
      r1 = x;
      g1 = 0;
      b1 = c;
    } else if (h >= 300 && h < 360) {
      r1 = c;
      g1 = 0;
      b1 = x;
    }

    rgb = {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255)
    };
  } else if (newColor.cmyk) {
    rgb = cmykToRgb(newColor.cmyk.c, newColor.cmyk.m, newColor.cmyk.y, newColor.cmyk.k);
  } else {
    return;
  }

  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  currentColor.value = {
    hex,
    rgb,
    hsl,
    hsv,
    cmyk,
    alpha: newColor.alpha ?? currentColor.value.alpha
  };

  updateColorInputs();
  htmlColorInput.value = hex;
  addToHistory(hex);
}

function updateColorInputs() {
  colorInputs.value = { ...currentColor.value };
}

function updateFromHSL() {
  updateColor({ hsl: currentColor.value.hsl });
}

function updateFromAlpha() {
  updateColorInputs();
}

function updateFromHtmlColor() {
  updateColor({ hex: htmlColorInput.value });
}

function updateFromInput(type: string) {
  setTimeout(() => {
    updateColor({ [type]: colorInputs.value[type as keyof Color] });
  }, 100);
}

function validateInput(type: string) {
  if (type === 'hex') {
    const hex = colorInputs.value.hex;
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      colorInputs.value.hex = currentColor.value.hex;
    }
  }
}

function setColor(hex: string) {
  updateColor({ hex });
}

function randomColor() {
  const hex =
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
  updateColor({ hex });
}

function resetColor() {
  updateColor({ hex: '#3B82F6' });
}

function generatePalette(type: string) {
  paletteType.value = type;
  const palette: string[] = [];
  const baseHue = currentColor.value.hsl.h;

  switch (type) {
    case 'monochromatic':
      paletteType.value = '单色';
      for (let i = 0; i < 5; i++) {
        const lightness = 20 + i * 15;
        palette.push(hslToHex(baseHue, currentColor.value.hsl.s, lightness));
      }
      break;

    case 'analogous':
      paletteType.value = '类似色';
      for (let i = -2; i <= 2; i++) {
        const hue = (baseHue + i * 30 + 360) % 360;
        palette.push(hslToHex(hue, currentColor.value.hsl.s, currentColor.value.hsl.l));
      }
      break;

    case 'complementary':
      paletteType.value = '互补色';
      palette.push(currentColor.value.hex);
      palette.push(hslToHex((baseHue + 180) % 360, currentColor.value.hsl.s, currentColor.value.hsl.l));
      palette.push(hslToHex(baseHue, currentColor.value.hsl.s, Math.max(20, currentColor.value.hsl.l - 20)));
      palette.push(hslToHex((baseHue + 180) % 360, currentColor.value.hsl.s, Math.max(20, currentColor.value.hsl.l - 20)));
      palette.push(hslToHex(baseHue, Math.max(20, currentColor.value.hsl.s - 30), currentColor.value.hsl.l));
      break;

    case 'triadic':
      paletteType.value = '三角色';
      for (let i = 0; i < 3; i++) {
        const hue = (baseHue + i * 120) % 360;
        palette.push(hslToHex(hue, currentColor.value.hsl.s, currentColor.value.hsl.l));
      }
      palette.push(hslToHex(baseHue, Math.max(20, currentColor.value.hsl.s - 20), Math.min(80, currentColor.value.hsl.l + 20)));
      palette.push(hslToHex((baseHue + 120) % 360, Math.max(20, currentColor.value.hsl.s - 20), Math.min(80, currentColor.value.hsl.l + 20)));
      break;
  }

  generatedPalette.value = palette;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function addToHistory(hex: string) {
  if (!colorHistory.value.includes(hex)) {
    colorHistory.value.unshift(hex);
    colorHistory.value = colorHistory.value.slice(0, 32); // 限制历史记录数量
    saveColorHistory();
  }
}

function clearHistory() {
  colorHistory.value = [];
  saveColorHistory();
}

function loadColorHistory() {
  try {
    const saved = localStorage.getItem('color-picker-history');
    if (saved) {
      colorHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载颜色历史失败:', error);
  }
}

function saveColorHistory() {
  try {
    localStorage.setItem('color-picker-history', JSON.stringify(colorHistory.value));
  } catch (error) {
    console.error('保存颜色历史失败:', error);
  }
}
</script>

<style scoped>
/* 自定义滑块样式 */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type='range']::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #333;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type='range']::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  border: none;
}

input[type='range']::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #333;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
