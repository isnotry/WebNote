# WebNote - 在线记事本

一个简单、安全的在线记事本应用，支持临时存储笔记并生成分享链接。

![WebNote](https://cdn.jsdelivr.net/gh/isnotry/WebNote@main/images/screenshot.png)

## 功能特性

- 📝 **简单易用** - 无需注册，直接开始记录
- 🔒 **临时存储** - 笔记自动保存7天
- 🔗 **分享链接** - 一键生成分享地址
- 🌐 **双语支持** - 支持中文和英文界面
- 📱 **响应式设计** - 适配各种设备屏幕

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm start
```

服务将在 `http://localhost:8080` 启动。

## 使用说明

### 创建笔记

1. 在首页的文本框中输入笔记内容
2. 点击"创建笔记"按钮
3. 系统会生成一个唯一的分享链接
4. 复制链接并分享给他人

### 查看笔记

1. 通过分享链接访问笔记
2. 笔记内容包括：
   - 笔记内容
   - 创建时间
   - 过期时间
3. 支持一键复制笔记内容

### 语言切换

- 点击右上角的语言切换按钮（English/中文）
- 界面会立即切换语言，不会刷新页面

## 技术栈

- **后端**: Node.js + Express
- **前端**: 原生 HTML/CSS/JavaScript
- **数据存储**: 本地文件系统 (JSON)
- **工具**: UUID 生成唯一ID

## 项目结构

```
webnote/
├── public/           # 前端静态文件
│   ├── index.html    # 首页
│   ├── note.html     # 笔记详情页
│   ├── expired.html  # 笔记过期页面
│   ├── notfound.html # 笔记未找到页面
│   ├── i18n.js       # 国际化模块
│   ├── script.js     # 首页脚本
│   └── styles.css    # 样式文件
├── notes/            # 笔记数据存储目录
├── server.js         # 服务器主文件
├── package.json      # 项目配置
└── README.md         # 项目文档
```

## API 接口

### 创建笔记

**请求**

```http
POST /api/notes
Content-Type: application/json

{
  "content": "笔记内容"
}
```

**响应**

```json
{
  "id": "uuid",
  "url": "/note/uuid",
  "expiresAt": "2026-03-31T06:11:34.793Z"
}
```

### 获取笔记

**请求**

```http
GET /api/notes/:id
```

**响应**

```json
{
  "id": "uuid",
  "content": "笔记内容",
  "createdAt": "2026-03-24T06:11:34.793Z",
  "expiresAt": "2026-03-31T06:11:34.793Z"
}
```

## 安全特性

- 笔记内容自动过期（7天）
- 违禁词过滤（暴力、色情、赌博等）
- XSS 防护
- 笔记ID使用UUID，防止猜测

## 配置说明

### 端口配置

默认端口为 8080，可通过环境变量修改：

```bash
PORT=3000 npm start
```

### 过期时间配置

在 `server.js` 中修改 `EXPIRY_DAYS` 常量：

```javascript
const EXPIRY_DAYS = 7; // 笔记保存天数
```

### 清理间隔

过期笔记清理间隔为每小时一次，可在 `server.js` 中修改：

```javascript
setInterval(cleanExpiredNotes, 60 * 60 * 1000); // 毫秒
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

***

# WebNote - Online Notepad

A simple and secure online notepad application with temporary storage and shareable links.

## Features

- 📝 **Simple to Use** - No registration required, start writing immediately
- 🔒 **Temporary Storage** - Notes are automatically saved for 7 days
- 🔗 **Share Links** - Generate shareable links with one click
- 🌐 **Bilingual Support** - Supports Chinese and English interfaces
- 📱 **Responsive Design** - Adapts to various device screens

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Server

```bash
npm start
```

The server will start at `http://localhost:8080`.

## Usage Guide

### Creating a Note

1. Enter your note content in the text box on the homepage
2. Click the "Create Note" button
3. The system will generate a unique shareable link
4. Copy the link and share it with others

### Viewing a Note

1. Access the note via the shareable link
2. The note includes:
   - Note content
   - Creation time
   - Expiration time
3. Supports one-click copy of note content

### Language Switching

- Click the language switch button in the top right corner (English/中文)
- The interface will immediately switch language without page refresh

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Data Storage**: Local File System (JSON)
- **Tools**: UUID for unique ID generation

## Project Structure

```
webnote/
├── public/           # Frontend static files
│   ├── index.html    # Homepage
│   ├── note.html     # Note details page
│   ├── expired.html  # Note expired page
│   ├── notfound.html # Note not found page
│   ├── i18n.js       # Internationalization module
│   ├── script.js     # Homepage script
│   └── styles.css    # Stylesheet
├── notes/            # Notes data storage directory
├── server.js         # Main server file
├── package.json      # Project configuration
└── README.md         # Project documentation
```

## API Endpoints

### Create Note

**Request**

```http
POST /api/notes
Content-Type: application/json

{
  "content": "Note content"
}
```

**Response**

```json
{
  "id": "uuid",
  "url": "/note/uuid",
  "expiresAt": "2026-03-31T06:11:34.793Z"
}
```

### Get Note

**Request**

```http
GET /api/notes/:id
```

**Response**

```json
{
  "id": "uuid",
  "content": "Note content",
  "createdAt": "2026-03-24T06:11:34.793Z",
  "expiresAt": "2026-03-31T06:11:34.793Z"
}
```

## Security Features

- Automatic note expiration (7 days)
- Forbidden word filtering (violence, pornography, gambling, etc.)
- XSS protection
- Note IDs use UUID to prevent guessing

## Configuration

### Port Configuration

Default port is 8080, can be modified via environment variable:

```bash
PORT=3000 npm start
```

### Expiration Time Configuration

Modify the `EXPIRY_DAYS` constant in `server.js`:

```javascript
const EXPIRY_DAYS = 7; // Note retention days
```

### Cleanup Interval

Expired note cleanup runs every hour, can be modified in `server.js`:

```javascript
setInterval(cleanExpiredNotes, 60 * 60 * 1000); // milliseconds
```

## License

MIT

## Contributing

Issues and Pull Requests are welcome!

***

**WebNote - Your temporary notepad**
