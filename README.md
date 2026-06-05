# 考研 408 代码题系统

这是一个多模块纯前端 PWA 应用，适合上传 GitHub 后用 Vercel 部署，也可以在 Chrome 中安装为本地应用。

## 功能

- 主页题库列表
- 新建、编辑、删除、搜索、筛选题目
- 题目图片导入、拖拽导入、粘贴截图导入
- 题目图片预览页自动大图展示
- 多方法代码管理
- 方法备注
- 每个方法可添加 HTML 动画演示
- 预览页默认只显示题目和代码，备注/动画放在按钮里
- Monaco Editor 代码编辑器，联网时接近 VSCode 体验
- Monaco 加载失败时自动降级为内置编辑器
- IndexedDB 本地大容量浏览器存储
- 题库 JSON 导入/导出
- PWA manifest + service worker，可用 Chrome 安装

## 目录结构

```text
.
├── index.html
├── package.json
├── vercel.json
├── sw.js
├── public/
│   ├── manifest.webmanifest
│   └── icons/
├── src/
│   ├── main.js
│   ├── db.js
│   ├── models.js
│   ├── state.js
│   ├── utils.js
│   ├── components/
│   │   ├── codeEditor.js
│   │   ├── highlight.js
│   │   ├── modal.js
│   │   └── toast.js
│   ├── views/
│   │   ├── shell.js
│   │   ├── homeView.js
│   │   ├── editorView.js
│   │   └── previewView.js
│   └── styles/
│       ├── base.css
│       ├── layout.css
│       ├── editor.css
│       ├── preview.css
│       └── responsive.css
└── scripts/
    └── check.mjs
```

## 本地运行

最简单方式：直接用 VSCode Live Server 或任意静态服务器打开根目录。

也可以运行：

```bash
npm run dev
```

如果没有安装依赖，`npx` 会自动拉取一个临时静态服务器。

## 上传 GitHub + Vercel

1. 解压 zip。
2. 将整个文件夹上传到 GitHub 仓库。
3. Vercel 新建项目，导入该仓库。
4. Framework Preset 选 `Other`。
5. Build Command 留空。
6. Output Directory 留空或填 `.`。
7. 部署完成后，用 Chrome 打开 Vercel 链接。
8. 地址栏右侧出现安装图标后，点击安装为本地应用。

## 数据保存说明

题目、图片、代码、备注、动画 HTML 默认保存在浏览器 IndexedDB 中。换浏览器、清缓存、换设备前，请先点击“导出题库”备份 JSON。

## 维护建议

- 改编辑器功能：`src/components/codeEditor.js`
- 改题库数据结构：`src/models.js`
- 改本地存储：`src/db.js`
- 改主页：`src/views/homeView.js`
- 改编写页：`src/views/editorView.js`
- 改预览页：`src/views/previewView.js`
- 改样式：`src/styles/`
