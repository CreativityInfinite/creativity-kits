# Creativity Kits (Nuxt 3 + Tailwind + i18n)

一个优雅现代的创意工具套件，包含 100+ 实用小工具（文本/数据/媒体/地图/正则/时间等）。支持暗色主题、tailwindcss-animate 动效、卡片内独立运行（动态组件，无整页刷新）、I18N（简体/繁体/英文）、CI 与 Railway 部署。

## 技术栈

- Nuxt 3 + Vue 3 (script setup)
- TailwindCSS + tailwindcss-animate（暗色模式 class 策略）
- @nuxtjs/i18n 多语言
- @nuxtjs/color-mode 主题切换
- 动态 import 生成工具微组件网格（Bento Grid）

## 本地开发

```bash
npm install
npm run dev
```

## 生产构建与启动

```bash
npm run build
npm run start
```

## 目录结构

- pages/index.vue: 首页 Tab + Bento Grid 卡片网格
- tools/\*: 每个工具一个目录（Component.vue + meta.ts）
- composables/useTools.ts: 自动扫描工具元数据与懒加载组件
- locales/\*: 多语言词条（简体/繁体/英文）
- components/\*: 公共组件（Tab、Card、主题与语言切换等）
- scripts/new-tool.js: 脚手架命令，快速新建工具骨架

## 新增工具

```bash
npm run new:tool
# 按提示输入：category、id、name、desc、tags
```

脚手架会创建 tools/<category>/<id>/{Component.vue, meta.ts} 并在 locales 中补充词条模板。

## CI

- .github/workflows/ci.yml：Lint + Test + Build

## 部署到 Railway

- 方案 1：Dockerfile（推荐）
- 方案 2：Railway.toml（可选）
  在 Railway 新建项目，连接该仓库：
- Build Command: `npm run build`
- Start Command: `npm run start`
- 环境变量：参考 `.env.example`（如需）

## 免责声明

本项目中部分工具可能引用 Web API 或第三方库的浏览器能力（例如 ffmpeg.wasm、Map SDK 等），默认按需懒加载或以占位示例实现，并在工具卡片说明中标注限制。请根据实际需要替换为后端服务或提供密钥配置。
