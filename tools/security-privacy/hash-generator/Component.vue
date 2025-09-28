<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">输入文本</label>
      <textarea
        v-model="input"
        @input="generateHashes"
        rows="4"
        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="请输入要计算哈希值的文本..."
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">MD5</label>
            <button @click="copyHash('md5')" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <input v-model="hashes.md5" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-1</label>
            <button @click="copyHash('sha1')" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <input v-model="hashes.sha1" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-256</label>
            <button @click="copyHash('sha256')" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <input v-model="hashes.sha256" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-384</label>
            <button @click="copyHash('sha384')" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <input v-model="hashes.sha384" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-512</label>
            <button @click="copyHash('sha512')" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <input v-model="hashes.sha512" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">Base64</label>
            <button @click="copyHash('base64')" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">复制</button>
          </div>
          <input v-model="hashes.base64" readonly class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">说明</h3>
      <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <li>• 所有哈希计算都在浏览器本地完成，不会上传到服务器</li>
        <li>• MD5 和 SHA-1 已不推荐用于安全用途，仅供兼容性使用</li>
        <li>• 推荐使用 SHA-256 或更高版本的 SHA 算法</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const input = ref('Hello World');
const hashes = ref({
  md5: '',
  sha1: '',
  sha256: '',
  sha384: '',
  sha512: '',
  base64: ''
});

async function generateHashes() {
  if (!input.value) {
    Object.keys(hashes.value).forEach((key) => {
      hashes.value[key as keyof typeof hashes.value] = '';
    });
    return;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(input.value);

  try {
    // Base64 编码（对 UTF-8 文本安全）
    hashes.value.base64 = arrayBufferToBase64(data);

    // 使用 Web Crypto API 计算哈希
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
    hashes.value.sha1 = bufferToHex(sha1Buffer);

    const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
    hashes.value.sha256 = bufferToHex(sha256Buffer);

    const sha384Buffer = await crypto.subtle.digest('SHA-384', data);
    hashes.value.sha384 = bufferToHex(sha384Buffer);

    const sha512Buffer = await crypto.subtle.digest('SHA-512', data);
    hashes.value.sha512 = bufferToHex(sha512Buffer);

    // MD5 需要自实现（简化版本）
    hashes.value.md5 = simpleMD5(input.value);
  } catch (error) {
    console.error('哈希计算失败:', error);
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 标准 MD5 实现（RFC 1321 的 JS 版本，纯前端，无第三方依赖）
 * 仅用于校验目的，勿用于安全用途
 */
function simpleMD5(str: string): string {
  function toUtf8(s: string): Uint8Array {
    return new TextEncoder().encode(s);
  }
  function add(x: number, y: number) {
    return (x + y) & 0xffffffff;
  }
  function rotl(x: number, n: number) {
    return (x << n) | (x >>> (32 - n));
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add(rotl(add(add(a, q), add(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~b), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function toWordArray(bytes: Uint8Array): number[] {
    const l = bytes.length;
    const n = (((l + 8) >> 6) + 1) * 16;
    const words = new Array(n).fill(0);
    for (let i = 0; i < l; i++) {
      words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    }
    words[l >> 2] |= 0x80 << ((l % 4) * 8);
    const bitLen = l * 8;
    words[n - 2] = bitLen & 0xffffffff;
    words[n - 1] = (bitLen / 0x100000000) | 0;
    return words;
  }
  function toHex(num: number): string {
    const hex = (num >>> 0).toString(16);
    return ('00000000' + hex).slice(-8);
  }

  const x = toWordArray(toUtf8(str));
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < x.length; i += 16) {
    const oa = a,
      ob = b,
      oc = c,
      od = d;

    a = ff(a, b, c, d, x[i + 0], 7, 0xd76aa478);
    d = ff(d, a, b, c, x[i + 1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, x[i + 2], 17, 0x242070db);
    b = ff(b, c, d, a, x[i + 3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, x[i + 4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, x[i + 5], 12, 0x4787c62a);
    c = ff(c, d, a, b, x[i + 6], 17, 0xa8304613);
    b = ff(b, c, d, a, x[i + 7], 22, 0xfd469501);
    a = ff(a, b, c, d, x[i + 8], 7, 0x698098d8);
    d = ff(d, a, b, c, x[i + 9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, x[i + 10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, x[i + 11], 22, 0x895cd7be);
    a = ff(a, b, c, d, x[i + 12], 7, 0x6b901122);
    d = ff(d, a, b, c, x[i + 13], 12, 0xfd987193);
    c = ff(c, d, a, b, x[i + 14], 17, 0xa679438e);
    b = ff(b, c, d, a, x[i + 15], 22, 0x49b40821);

    a = gg(a, b, c, d, x[i + 1], 5, 0xf61e2562);
    d = gg(d, a, b, c, x[i + 6], 9, 0xc040b340);
    c = gg(c, d, a, b, x[i + 11], 14, 0x265e5a51);
    b = gg(b, c, d, a, x[i + 0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[i + 5], 5, 0xd62f105d);
    d = gg(d, a, b, c, x[i + 10], 9, 0x02441453);
    c = gg(c, d, a, b, x[i + 15], 14, 0xd8a1e681);
    b = gg(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[i + 9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, x[i + 14], 9, 0xc33707d6);
    c = gg(c, d, a, b, x[i + 3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, x[i + 8], 20, 0x455a14ed);
    a = gg(a, b, c, d, x[i + 13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, x[i + 2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, x[i + 7], 14, 0x676f02d9);
    b = gg(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, x[i + 5], 4, 0xfffa3942);
    d = hh(d, a, b, c, x[i + 8], 11, 0x8771f681);
    c = hh(c, d, a, b, x[i + 11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, x[i + 14], 23, 0xfde5380c);
    a = hh(a, b, c, d, x[i + 1], 4, 0xa4beea44);
    d = hh(d, a, b, c, x[i + 4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, x[i + 7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, x[i + 10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, x[i + 13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, x[i + 0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, x[i + 3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, x[i + 6], 23, 0x04881d05);
    a = hh(a, b, c, d, x[i + 9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, x[i + 12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, x[i + 15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, x[i + 2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, x[i + 0], 6, 0xf4292244);
    d = ii(d, a, b, c, x[i + 7], 10, 0x432aff97);
    c = ii(c, d, a, b, x[i + 14], 15, 0xab9423a7);
    b = ii(b, c, d, a, x[i + 5], 21, 0xfc93a039);
    a = ii(a, b, c, d, x[i + 12], 6, 0x655b59c3);
    d = ii(d, a, b, c, x[i + 3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, x[i + 10], 15, 0xffeff47d);
    b = ii(b, c, d, a, x[i + 1], 21, 0x85845dd1);
    a = ii(a, b, c, d, x[i + 8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[i + 6], 15, 0xa3014314);
    b = ii(b, c, d, a, x[i + 13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, x[i + 4], 6, 0xf7537e82);
    d = ii(d, a, b, c, x[i + 11], 10, 0xbd3af235);
    c = ii(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, x[i + 9], 21, 0xeb86d391);

    a = add(a, oa);
    b = add(b, ob);
    c = add(c, oc);
    d = add(d, od);
  }
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

async function copyHash(type: keyof typeof hashes.value) {
  const value = hashes.value[type];
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch (err) {
    console.error('复制失败:', err);
  }
}

// 初始计算
generateHashes();
</script>
