你是一名全栈前端工程师，请为一个包含 100+小工具的网站集合构建完整项目，要求一次性给出可直接运行的 Nuxt 3 代码、依赖、配置与部署说明。网站需要以 Bento Grid 风格设计，并通过 tailwind 与 tailwindcss-animate 实现精致的动效与卡片切换动画。[1][3] 技术栈限定使用 Nuxtjs、tailwind、Vue3。[2] 首页采用卡片网格列出所有工具，工具在卡片内独立运行（使用客户端组件或动态组件，无整页刷新）。[4] 开发中结合 AI 编程加速代码生成与模块拆分，确保可维护性与可扩展性。[5]

功能与交互要求：

- 支持浅色/深色主题切换（优先使用 Tailwind 的暗色模式策略和 Nuxt 的 color mode 集成）。
- 响应式布局，兼容桌面端与移动端，Bento Grid 在不同断点保持优雅排布与动画连续性。[3]
- 首页顶部提供过滤 Tab（如：全部/热门/最新/分类标签等），每次切换 Tab 时，Tab 下方的卡片进行动态浮动与过渡动画（使用 tailwindcss-animate、CSS 变量与 Vue 过渡组合实现）。
- 不需要 Header、Footer，所有内容直接展示在页面内，Tab 置顶，卡片网格占据主体；参考 UI 布局：https://www.zhangyu.dev/。
- 支持 I18N，默认内置中文简体、中文繁体、英文三种语言，并为每个工具卡片与全局文案提供语言切换。
- 技术栈明确：Nuxtjs、tailwind、Vue3，使用 Nuxt 模块化方式组织工具目录与路由。[2]
- 首页的卡片为独立运行的小工具微组件（如：文本处理、图片压缩、正则测试、JSON 格式化、单位换算等），以插件化注册，支持按需加载（动态 import），无整页刷新。[4]
- 使用 Bento Grid 视觉设计：不规则网格、卡片尺寸有节奏变化、留白与层次分明、动效轻盈不喧宾夺主。[3]
- 项目需要包含完整的介绍文档（README）、环境变量示例、CI/CD 与部署文件，并提供适配 Railway 的部署配置与步骤说明。
- 结合 AI 编程：为每个工具的输入输出逻辑提供抽象接口和自动测试样例生成；可通过简单 JSON 元数据定义工具信息（名称、图标、描述、标签、组件入口），AI 可根据元数据批量生成基本工具骨架。[5]

技术实现细节与交付物要求：

- 项目结构：apps（主站）与 packages（公用组件/工具函数）或采用单仓库模块化组织；/tools 目录存放每个小工具的组件与元数据（如 tools.json 或每工具独立 meta.ts）。
- 使用 Nuxt 3 + Vue 3（<script setup>），Tailwind 已配置暗色模式（class）与自定义主题色，集成 tailwindcss-animate 用于卡片过渡与悬浮动画。
- I18N 使用@nuxtjs/i18n 或 nuxt-i18n，默认语言为中文简体，并提供繁体与英文词条；语言切换按钮固定在页面内合适位置（如侧边或角落）。
- Tab 过滤：基于工具的标签与分类字段进行筛选；切换时使用 FLIP 或基于 transition-group 的布局过渡，卡片带浮动与渐隐/渐显组合动效。
- 卡片交互：每个工具组件为独立 Client 组件（ssr: false 或在客户端挂载），支持本地状态管理与持久化（localStorage），工具运行不触发整页刷新。[4]
- 响应式：使用 Tailwind 断点（sm/md/lg/xl/2xl），Bento 网格在移动端切为单列或双列；为大卡/小卡定义不同 span 与最小高度。
- 无 Header/Footer：页面主体即为 Tab+Cards 的可滚动区域；提供回到顶部与简洁的全局操作入口（如语言切换、主题切换）。
- 部署：提供 Railway 部署 Dockerfile 或 Railway 配置文件，说明如何设置环境变量、构建与启动命令；包含 README 的本地开发、构建与部署流程详解。
- 质量保障：提供 ESLint/Prettier 配置、基本单元测试（Vitest）与端到端测试建议（Playwright），并给出示例测试用例；在 CI 中运行 lint 与测试。
- 数据与扩展：为工具元数据提供快速新增脚手架命令（如 npm run new:tool），自动生成组件骨架与词条模板；结合 AI 提示生成默认说明与示例。[5]

工具分类与清单（至少 10 个分类，合计 100+ 工具）

1. 文本与格式化（12）

- markdown-to-html
- html-to-markdown
- base64-encode
- base64-decode
- url-encode
- url-decode
- json-pretty
- json-minify
- yaml-to-json
- json-to-yaml
- csv-to-json
- text-case-converter（小写/大写/标题/驼峰/下划线）

2. 正则与解析（8）

- regex-tester（含分组高亮）
- glob-tester
- diff-text（侧比对与行差异）
- slug-generator（多语言转 slug）
- uuid-generator（v1/v4/nanoid 可选）
- lorem-ipsum-generator（中英随机文本）
- credit-card-validator（Luhn 校验）
- iban-validator

3. 时间与日期（10）

- timestamp-converter（Unix/ISO）
- date-diff-calculator
- cron-expression-validator
- cron-next-run
- timezone-converter
- working-days-calculator（排除周末与节日）
- age-calculator
- countdown-timer
- ics-calendar-generator（生成 .ics 文件）
- natural-date-parser（自然语言日期解析）

4. 颜色与图形（10）

- color-picker
- color-format-converter（HEX/RGB/HSL/HSV/CMYK）
- palette-generator（基于主色）
- gradient-generator（线性/径向）
- contrast-checker（WCAG AA/AAA）
- color-blindness-simulator（近似模拟）
- favicon-generator（文本/图标生成）
- svg-optimizer（SVGO 前端裁剪配置）
- svg-to-png
- ascii-art-generator（图像转字符画，前端 Canvas）

5. 图片/多媒体（10）

- image-resizer（前端 Canvas）
- image-compressor（质量/尺寸）
- exif-viewer
- meme-generator（文本叠加）
- sprite-sheet-generator（精灵图合成）
- image-watermark
- audio-trimmer（WebAudio）
- audio-format-converter（浏览器支持范围内，如 wav <-> webm，说明限制）
- video-gif-converter（ffmpeg.wasm，标注较大体积可懒加载）
- webcam-capture-tool（拍照与保存）

6. 开发与网络（12）

- http-requester（Fetch/Headers/响应预览）
- websocket-client
- jwt-decoder（不联网）
- jwt-signer（需密钥/仅本地演示）
- oauth-pkce-helper（生成 code_verifier/challenge）
- dns-lookup（公共 API，说明可替换后端服务）
- ip-geo-lookup（公共 API/可降级）
- user-agent-parser
- macaddress-vendor-lookup（本地字典/可选远程）
- mime-type-finder（文件扩展名/Content-Type）
- url-parser（拆解/构建）
- qr-code-generator（二维码生成）

7. 数据与文件（10）

- csv-merge-split
- tsv-converter（TSV <-> CSV/JSON）
- json-schema-validator（ajv 前端运行）
- json-diff-viewer
- excel-to-csv（SheetJS 前端解析，按需懒加载）
- pdf-merger（标注需后端或使用 pdf-lib 合并限制）
- pdf-splitter（标注限制）
- file-hash-calculator（MD5/SHA-1/SHA-256）
- zip-unzip（fflate，浏览器内）
- text-encoding-converter（UTF-8/GBK/Shift_JIS）

8. 安全与隐私（8）

- password-generator（规则可配）
- password-strength-checker（zxcvbn 或自实现）
- twofa-totp-generator（本地计算）
- rsa-keypair-generator（WebCrypto）
- aes-encrypt-decrypt（AES-GCM）
- hash-generator（SHA-256/512 等）
- secure-note（本地加密存储）
- image-metadata-sanitizer（去除 EXIF）

9. 数学与单位（10）

- unit-converter（长度/质量/温度/速度/体积）
- currency-converter（公共汇率 API/可离线演示）
- fraction-decimal-converter
- matrix-calculator（加减乘/行列式）
- equation-solver（一元/二次/数值解）
- statistics-tool（均值/方差/标准差/分位数）
- combinatorics-calculator（排列组合）
- prime-tester-and-generator
- big-number-calculator（任意精度）
- mortgage-loan-calculator（等额本息/本金）

10. 生产力与办公（10）

- kanban-mini（本地拖拽看板）
- pomodoro-timer
- habit-tracker（本地存储）
- markdown-editor（预览/大纲）
- mindmap-editor（简单节点/层级）
- table-editor（可排序/筛选）
- resume-builder（模板导出 PDF，说明限制）
- meeting-notes-formatter（结构化模版）
- email-template-builder（HTML 邮件模板）
- calendar-heatmap-generator（提交热力图）

11. 社媒与营销（6）

- utm-builder
- open-graph-image-generator（动态文本 →OG 图）
- social-post-scheduler（本地计划/导出日程）
- hashtag-generator（基于输入主题）
- keyword-density-analyzer
- sitemap-generator（静态站点 XML）

12. 教育与语言（6）

- phonetic-transcriber（IPA 近似/英文）
- pinyin-converter（汉字转拼音）
- text-readability-analyzer（Flesch 等，中文说明）
- flashcard-generator（导入/导出）
- typing-practice（自定义段落/速度统计）
- quiz-maker（JSON 题库 → 测验）

13. 地图与地理（5）

- geojson-viewer-editor（MapLibre/Leaflet，懒加载）
- coordinates-converter（度分秒/十进制）
- distance-calculator（Haversine）
- elevation-profiler（公共 API/降级）
- map-snapshot-generator（静态图，说明需 API Key）

14. 系统与浏览器（7）

- clipboard-manager（历史记录，本地存储）
- file-drop-inspector（拖拽查看文件信息）
- notifications-tester（浏览器通知）
- service-worker-tester（离线/缓存演示）
- localstorage-inspector
- cookie-editor
- performance-profiler（测量关键指标）

合计：12+8+10+10+10+12+10+8+10+10+6+6+5+7 = 124 个工具（满足 100+ 要求）。

目标：

- 交付一个可运行的 Nuxt 3 项目，包含上述全部功能、动画、I18N 与部署文件；首页以 Bento Grid 展示 100+工具卡片，并能通过 Tab 进行动态过滤和流畅的动效切换。[1][3][4]
- 现在，你需要将每个工具分类实现一个工具的完整代码示例（组件、元数据、国际化词条），并展示如何集成到主站的卡片网格与过滤系统中。[2][4]
- 提供完整的项目结构、依赖清单、配置文件（如 nuxt.config.ts、tailwind.config.js、i18n 配置等）与部署说明，确保项目可直接运行与扩展。
- 代码与文档清晰规范，开箱即用，支持 Railway 一键部署。
- 通过 AI 编程能力加速生成工具模块与国际化词条，提高迭代效率与可维护性。[5]
- 文本与对应的 Icon 搭配，保证 UI 的美观性，使用暗色为主的背景，并搭配色彩鲜艳的配色
