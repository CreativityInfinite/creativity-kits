import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css', '~/assets/css/animations.css'],
  ssr: true,
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n', '@nuxtjs/color-mode'],
  app: {
    head: {
      title: 'Creativity Kits',
      titleTemplate: '%s · Creativity Kits',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'description', content: 'Creativity Kits · 一个优雅现代的创意工具套件，涵盖文本/数据/媒体/地图/正则/时间等常用小工具，助你高效创作。' },
        { property: 'og:site_name', content: 'Creativity Kits' },
        { property: 'og:title', content: 'Creativity Kits' },
        { property: 'og:description', content: '优雅现代的创意工具套件 · 文本/数据/媒体/地图/正则/时间等多功能集合' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://kits.creativityinfinite.com' },
        { property: 'og:image', content: 'https://kits.creativityinfinite.com/og-image.svg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Creativity Kits' },
        { name: 'twitter:description', content: 'A beautiful suite of creative tools for everyday work.' },
        { name: 'twitter:image', content: 'https://kits.creativityinfinite.com/og-image.svg' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'canonical', href: 'https://kits.creativityinfinite.com' }
      ]
    }
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark'
  },
  tailwindcss: {
    viewer: false
  },
  i18n: {
    locales: [
      { code: 'zh-CN', language: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'zh-TW', language: 'zh-TW', name: '繁體中文', file: 'zh-TW.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'zh-CN',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
      redirectOn: 'root',
      fallbackLocale: 'zh-CN'
    }
  },
  nitro: {
    preset: 'node-server',
    compatibilityDate: '2025-09-26'
  },
  typescript: {
    strict: true
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  runtimeConfig: {
    public: {
      appName: 'Creativity Kits'
    }
  }
});
