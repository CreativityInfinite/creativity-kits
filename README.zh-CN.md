# Creativity Kits · 100+ Nuxt 3 创意工具集合（Bento Grid）

[English](./README.md) · [简体中文] · [繁體中文](./README.zh-TW.md)

一个美观、轻盈、可扩展的 100+ 小工具集合，基于 Nuxt 3 + Vue 3 + Tailwind CSS + tailwindcss-animate，实现 Bento Grid 风格，支持暗色/浅色主题、响应式布局、I18N（简体/繁体/英文）、以及独立在卡片内运行的工具微组件（无整页刷新）。

技术栈：Nuxt 3、Vue 3、Tailwind CSS、tailwindcss-animate

- 设计参考：https://www.zhangyu.dev/
- 视觉风格：Bento Grid，不规则网格与节奏化卡片尺寸、轻盈动效与光晕
- 交互核心：卡片为动态 import 的客户端组件，Tab/过滤切换结合 FLIP/TransitionGroup 流畅过渡

功能亮点
- 100+ 工具覆盖 14 大分类：文本、正则、时间日期、颜色图形、图片多媒体、开发网络、数据文件、安全隐私、数学单位、生产力办公、社媒营销、教育语言、地图地理、系统浏览器
- Tabs 过滤（全部/热门/最新/分类标签）+ 搜索（名称/标签）
- i18n（简中/繁中/英文）与语言切换按钮
- 暗色/浅色主题切换（@nuxtjs/color-mode + Tailwind dark class）
- Bento Grid + tailwindcss-animate 的过渡与悬浮动画
- SSR、ESLint、Prettier、Vitest、Dockerfile、Railway.toml 一应俱全

项目结构（关键）
- app.vue：右上角主题/主题风格/语言开关，全局容器
- pages/index.vue：Bento 首页网格、Tabs、搜索与过渡
- components/：Tabs、ToolCard、BackToTop、UI 组件等
- tools/：每个工具独立目录，含 Component.vue 与 meta.ts
- i18n/locales：en.json、zh-CN.json、zh-TW.json
- tailwind.config.ts：darkMode class、主题扩展、tailwindcss-animate
- nuxt.config.ts：模块、i18n、color-mode、head 元数据等
- Railway.toml + Dockerfile：生产可部署
- vitest.config.ts：单测配置
- scripts/：i18n/标签处理脚本（注意：new-tool 脚手架目前为空位说明）

本地开发
- Node.js 20+
- npm ci
- npm run dev
- 访问 http://localhost:3000

构建与运行（SSR）
- npm run build
- npm run start

静态导出
- npm run generate

代码质量
- npm run lint / lint:fix
- npm run format / format:check

测试
- npm run test / test:watch
- 建议使用 Playwright 做 E2E：加载首页、切换 Tab、语言切换等

环境变量
- 示例：.env
- NUXT_PUBLIC_APP_NAME="Creativity Kits"

部署到 Railway
- 仓库内已包含 Dockerfile 与 Railway.toml
- Railway 使用 Docker 构建（builder=dockerfile）
- 在 Railway 控制台设置环境变量，部署并暴露 3000 端口

GitHub 动态展示（替换占位）
- Star 趋势图（OWNER/REPO）：  
  https://api.star-history.com/svg?repos=OWNER/REPO&type=Date
- 统计卡片/贡献热力图（USERNAME）：
  - https://github-readme-stats.vercel.app/api?username=USERNAME&show_icons=true
  - https://streak-stats.demolab.com?user=USERNAME
  - https://contrib.rocks/image?repo=OWNER/REPO

脚手架（AI 友好，元数据驱动）
- package.json 内含 npm run new:tool 指向 scripts/new-tool.js（当前仓库未提供）
- 你可以自建 scripts/new-tool.js：
  - 交互式输入 id/name/category
  - 生成 tools/<category>/<id>/Component.vue 与 meta.ts
  - 自动补全 i18n 词条模板（en/zh-CN/zh-TW）

许可
- MIT

致谢
- @iconify/vue、dayjs、@nuxtjs/i18n、tailwindcss-animate 等