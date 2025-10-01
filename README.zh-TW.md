# Creativity Kits · 100+ Nuxt 3 創意工具集合（Bento Grid）

[English](./README.md) · [简体中文](./README.zh-CN.md) · [繁體中文]

一個美觀、輕盈且可擴展的 100+ 小工具集合，基於 Nuxt 3 + Vue 3 + Tailwind CSS + tailwindcss-animate，採用 Bento Grid 風格，支援深/淺色主題、響應式布局、I18N（繁中/簡中/英文），並以卡片內獨立執行的微元件運作（無整頁刷新）。

技術棧：Nuxt 3、Vue 3、Tailwind CSS、tailwindcss-animate

- 設計參考：https://www.zhangyu.dev/
- 視覺風格：Bento Grid，不規則網格與節奏化卡片尺寸、輕盈動效與光暈
- 互動核心：卡片為動態 import 的客戶端元件，Tab/篩選切換結合 FLIP/TransitionGroup 流暢過渡

功能亮點
- 100+ 工具覆蓋 14 大分類：文字、正則、時間日期、顏色圖形、圖片多媒體、開發網路、資料檔案、安全隱私、數學單位、生產力辦公、社媒行銷、教育語言、地圖地理、系統瀏覽器
- Tabs 篩選（全部/熱門/最新/分類標籤）+ 搜尋（名稱/標籤）
- i18n（繁中/簡中/英文）與語言切換按鈕
- 深/淺色主題切換（@nuxtjs/color-mode + Tailwind dark class）
- Bento Grid + tailwindcss-animate 的過渡與懸浮動畫
- SSR、ESLint、Prettier、Vitest、Dockerfile、Railway.toml 皆已就緒

專案結構（關鍵）
- app.vue：右上角主題/主題風格/語言開關，全域容器
- pages/index.vue：Bento 首頁網格、Tabs、搜尋與過渡
- components/：Tabs、ToolCard、BackToTop、UI 元件等
- tools/：每個工具獨立目錄，含 Component.vue 與 meta.ts
- i18n/locales：en.json、zh-CN.json、zh-TW.json
- tailwind.config.ts：darkMode class、主題擴展、tailwindcss-animate
- nuxt.config.ts：模組、i18n、color-mode、head 中繼資料等
- Railway.toml + Dockerfile：可直接部署
- vitest.config.ts：單元測試設定
- scripts/：i18n/標籤處理腳本（注意：new-tool 腳手架目前為空位說明）

本機開發
- Node.js 20+
- npm ci
- npm run dev
- 開啟 http://localhost:3000

建置與啟動（SSR）
- npm run build
- npm run start

靜態輸出
- npm run generate

程式品質
- npm run lint / lint:fix
- npm run format / format:check

測試
- npm run test / test:watch
- 建議使用 Playwright 做 E2E：首頁載入、切換 Tab、語言切換等

環境變數
- 範例：.env
- NUXT_PUBLIC_APP_NAME="Creativity Kits"

部署至 Railway
- 專案內含 Dockerfile 與 Railway.toml
- Railway 以 Docker 建置（builder=dockerfile）
- 在 Railway 控制台設定環境變數，部署並開放 3000 埠

GitHub 動態展示（替換佔位）
- Star 趨勢圖（OWNER/REPO）：  
  https://api.star-history.com/svg?repos=OWNER/REPO&type=Date
- 統計卡片/貢獻熱力圖（USERNAME）：
  - https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true
  - https://streak-stats.demolab.com?user=USERNAME
  - https://contrib.rocks/image?repo=OWNER/REPO

腳手架（AI 友善，元資料驅動）
- package.json 內含 npm run new:tool 指向 scripts/new-tool.js（目前未提供）
- 你可自建 scripts/new-tool.js：
  - 互動式輸入 id/name/category
  - 產生 tools/<category>/<id>/Component.vue 與 meta.ts
  - 自動補齊 i18n 詞條範本（en/zh-CN/zh-TW）

授權
- MIT

致謝
- @iconify/vue、dayjs、@nuxtjs/i18n、tailwindcss-animate 等