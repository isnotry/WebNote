# WebNote · 在线记事本

**简体中文** | [English](README.en.md)

![免注册](https://img.shields.io/badge/signup-not%20required-brightgreen)
![零构建](https://img.shields.io/badge/build-none-blue)
![单文件后端](https://img.shields.io/badge/backend-1%20file-lightgrey)
![数据自托管](https://img.shields.io/badge/data-self--hosted-orange)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

> 免注册的在线记事本 —— 写完一键拿到分享链接，笔记 7 天后自动删除，内容只留在你自己那台服务器上。

![界面截图](https://cdn.jsdelivr.net/gh/isnotry/WebNote@main/docs/screenshot.png)

---

## 它是什么

WebNote 把「随手记一段话，发个链接给对方」压到最短路径：打开首页就能写，点一下得到一条可分享的地址，不用注册、不用登录、不留账号。

前端是原生 HTML / CSS / JavaScript，没有任何打包步骤；后端只有一个 `server.js`，依赖只有 `express` 和 `uuid` 两个包，全部路由、校验、清理逻辑都在这个文件里。

每条笔记以 JSON 文件落在服务器本地的 `notes/` 目录，**不接数据库、不调用任何第三方服务**，满 7 天由服务端自动删除。需要长期留存的内容请自行另存一份。

## 特性

- **免注册** —— 没有账号体系，打开首页直接开写
- **一键分享** —— 创建后立即得到一条含 UUID 的链接，复制即可发送
- **自动过期** —— 每条笔记写死 7 天寿命，到期即物理删除
- **双语界面** —— 中文 / English 一键切换，页面不刷新
- **明暗主题** —— 圆形按钮切换，主题在首帧内联注入，不闪白
- **零构建前端** —— 没有 webpack / vite，改完 HTML 刷新即生效
- **内容过滤** —— 前后端共用同一份 19 词违禁词表，前端先拦、后端兜底
- **自托管** —— 数据落在自己的磁盘和端口上，不依赖任何外部服务
- **Docker 就绪** —— 仓库自带 `Dockerfile`，一条命令起服务

## 快速开始

### 本地运行

```bash
npm install
npm start
```

服务默认监听 8080 端口，浏览器打开 `http://localhost:8080` 即可。

### Docker 运行

```bash
docker build -t webnote .
docker run -d -p 8080:8080 -v "$PWD/notes:/app/notes" --name webnote webnote
```

笔记落在容器内 `/app/notes`，用 `-v` 把它挂到宿主机才不会随容器一起消失。

### 环境变量

| 变量 | 默认值 | 作用 |
|---|---|---|
| `PORT` | `8080` | HTTP 监听端口 |

## 内容校验规则

违禁词表硬编码在 `server.js` 与 `public/script.js` 两处，规则是 `content.includes(word)` 的**子串匹配**，命中即整条拒绝。

| 输入 | 结果 | 说明 |
|---|---|---|
| 空字符串或纯空白 | 前端拦下 | 前端弹「请输入笔记内容」并聚焦输入框，不发请求 |
| 含违禁词（如「赌博」） | 拒绝创建 | 前端先弹窗列出命中的词；绕过前端也会被后端以 400 拦下 |
| 「这项规定非法人组织也适用」 | 被误拦 | 无分词，子串匹配让「非法」命中了「非法人」 |
| 正常文本（含换行） | 创建成功 | 正文原样存进 JSON，详情页按预格式保留换行与缩进 |
| 含 `<script>alert(1)</script>` | 创建成功，但不会被解析 | 详情页用 `textContent` 写入，HTML 只当纯文本显示 |
| 请求体超过 100 KB | 直接返回 413 | `express.json()` 默认上限 100 KB，压根到不了校验分支 |
| 违禁词表之外的敏感词 | 放行 | 词表只有 19 个词，不做模糊匹配、不做拼音 / 谐音识别 |

## 界面说明

| 位置 | 元素 | 作用 |
|---|---|---|
| 顶部右侧 | 圆形主题按钮 | 切换明 / 暗主题，选择写入 `webnote-theme` |
| 顶部右侧 | `English` / `中文` 按钮 | 切换界面语言并写入 `webnote-lang`，不刷新页面 |
| 页面中部 | 笔记文本框 | 15 行高的编辑区，占位文案随语言切换 |
| 文本框下方 | 「创建笔记」按钮 | 调 `POST /api/notes`，成功后展开结果卡片 |
| 结果卡片 | 只读链接输入框 | 显示完整分享地址，点一下自动全选 |
| 结果卡片 | 「复制链接」按钮 | 写入剪贴板，按钮文字 2 秒后复原 |
| 结果卡片 | 「点击打开笔记 →」 | 新标签页打开该笔记 |
| 详情页左上 | 「← 返回首页」 | 回到创建页 |
| 详情页底部 | 「复制内容」按钮 | 复制笔记正文，同样 2 秒后复原 |

## 快捷键

项目没有注册任何自定义快捷键，也没有全局 `keydown` 监听，下面都是原生控件的默认行为：

| 操作 | 效果 | 说明 |
|---|---|---|
| 点击链接输入框 | 全选分享地址 | 绑定在 `click` 上，便于再手动 Ctrl / Cmd+C |
| Tab / Shift+Tab | 在输入框与按钮间移动焦点 | 原生 `input`、`textarea`、`button` 行为 |
| Enter / Space | 触发当前聚焦的按钮 | 原生按钮行为 |
| Enter（文本框内） | 换行 | 没有绑定回车提交，写完要点按钮 |
| Ctrl / Cmd+Z | 撤销输入 | 浏览器原生，文本框内有效 |

## 接口

### 创建笔记

```http
POST /api/notes
Content-Type: application/json

{ "content": "笔记内容" }
```

```json
{
  "id": "6f1c2b3a-…-9d4e",
  "url": "/note/6f1c2b3a-…-9d4e",
  "expiresAt": "2026-03-31T06:11:34.793Z"
}
```

### 读取笔记

```http
GET /api/notes/:id
```

返回 `{ id, content, createdAt, expiresAt }`；笔记过期或不存在时返回 `404` 与 `{ "error": "…" }`。

### 打开笔记页面

```http
GET /note/:id
```

ID 通过 UUID 正则校验，格式不对或文件不存在都渲染 `notfound.html`；已过期则先删文件再渲染 `expired.html`；正常时渲染 `note.html`，页面再自己去调一次读取接口。

## 过期与清理口径

```text
expiresAt  = createdAt + EXPIRY_DAYS × 24 × 60 × 60 × 1000
读取时（懒删除）: now > expiresAt                     → 删除该笔记文件，返回 404
定时清理（每小时）: now − 文件 mtime > EXPIRY_DAYS × 24h → 删除文件
```

- `EXPIRY_DAYS` 是 `server.js` 顶部的常量，默认 `7`，创建与判断都读它
- 打开笔记链接那一刻就会做一次过期判断：命中即**物理删除**文件，再渲染 `expired.html`，不是仅仅显示提示
- 定时任务每小时跑一次，服务启动时也会先跑一次；它按**文件 mtime** 而不是 JSON 里的 `expiresAt` 判断 —— 文件只在创建时写入一次，两者结果等价
- API 读取走的是同一套懒删除逻辑，区别只是返回 JSON 404 而不是错误页
- 分享链接没有访问控制：知道 UUID 的人就能读，不做鉴权、不做密码、不做阅后即焚

## 数据与隐私

所有数据只写在**你自己运行服务的这台机器**上。没有统计埋点，没有第三方字体 / CDN 依赖，页面资源全部同源。

| 存储位置 | 内容 | 生命周期 |
|---|---|---|
| 服务端 `notes/<uuid>.json` | 笔记正文、创建时间、过期时间 | 7 天后被删除 |
| 浏览器 `localStorage` → `webnote-lang` | 界面语言 `zh` / `en` | 常驻，除非手动清除 |
| 浏览器 `localStorage` → `webnote-theme` | 明暗主题 `light` / `dark` | 常驻，除非手动清除 |

服务端不写 Cookie、不记录访客标识，只往 stdout 打访问与错误日志。**分享链接本身就是访问凭证** —— 任何拿到完整链接的人都能读到正文，敏感内容不要往里放。

## 目录结构

```text
WebNote/
├── public/
│   ├── index.html              # 创建页：文本框 + 创建按钮 + 结果卡片
│   ├── note.html               # 详情页：正文 + 创建 / 过期时间 + 复制内容
│   ├── expired.html            # 笔记已过期提示页
│   ├── notfound.html           # 笔记未找到提示页
│   ├── i18n.js                 # 中英词条表 + 语言探测与切换
│   ├── script.js               # 创建页交互：校验、提交、复制链接
│   └── styles.css              # 全站样式（主题令牌另在 HTML 的 <style> 里）
├── docs/
│   ├── screenshot.png          # 中文界面截图（README.md 引用）
│   └── screenshot-en.png       # 英文界面截图（README.en.md 引用）
├── notes/                      # 笔记数据目录，运行时生成，不进仓库
├── server.js                   # 全部后端逻辑
├── Dockerfile                  # node:18-alpine 镜像
├── package.json
├── LICENSE
├── README.md                   # 中文主版（本文件）
└── README.en.md                # English version
```

## 开发说明

- 改过期天数：`server.js` 顶部的 `const EXPIRY_DAYS = 7;`
- 改清理频率：`server.js` 里 `setInterval(cleanExpiredNotes, 60 * 60 * 1000)` 的毫秒值
- 改违禁词：`server.js` 和 `public/script.js` 各有一份**同内容数组**，必须一起改 —— 前端那份只是省一次请求，后端那份才是真防线
- 改端口：用环境变量 `PORT`，不要写死
- 改主题色：暗色令牌在 `:root[data-theme="dark"]`，且 `index.html`、`note.html`、`expired.html`、`notfound.html` 的 `<head>` 各有一份内联副本，改一处要同步其余三处，否则首帧配色会不一致
- 改样式缓存：`styles.css` 的引用带 `?v=2`，大改样式后把版本号加一
- 加新文案：`zh` 和 `en` 两份词条都要补，`i18n.js` 里漏了会直接显示 key 本身；**空字符串是合法文案**（英文版 `editor.expiresAt` 就留空，因为英文语序里不需要尾词）
- 跑开发模式：`npm run dev`，与 `npm start` 等价（都是直接 `node server.js`，没有文件监听）
- 项目约定：前端不引入任何依赖、不引入构建步骤，样式用 CSS 变量而不是组件库

## 浏览器支持

| 依赖特性 | 最低版本 | 用途 |
|---|---|---|
| CSS 自定义属性 + `data-theme` | 除 IE 外全支持 | 明暗主题整套令牌 |
| `color-mix(in srgb, …)` | Chrome 111 / Safari 16.2 / Firefox 113 | 主题按钮与语言按钮的半透明底色 |
| `navigator.clipboard.writeText` | 需安全上下文 | 复制链接、复制正文 |
| SVG `<use href="#id">` 雪碧图 | Chrome 50 / Safari 12 / Firefox 55 | 主题、文档、锁、链接、星光五个图标 |
| `prefers-reduced-motion` | 同上 | 命中时关闭全部过渡动画 |

已知限制与兜底：

- **剪贴板接口在非 HTTPS 且非 localhost 的环境下会被浏览器拒绝** —— 代码里已兜底到 `document.execCommand('copy')`，`note.html` 走临时 textarea，创建页走 `select()` 后复制
- **`color-mix()` 在旧浏览器里整条声明失效** —— 按钮退化成透明底加边框，功能不受影响
- **页面强制 `color-scheme: only light`** —— 避免系统深色模式改写表单控件的默认配色
- **`<head>` 里的内联 `<style>` 与主题脚本** 是为了让主题在首帧就定下来、消除明暗闪烁；维护这几个文件时不要删掉这段

## 许可

[MIT](LICENSE) © 2026 isnotry
