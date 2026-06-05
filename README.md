# 考研408代码题系统

这是一个适合 GitHub + Vercel 部署的扁平模块版 PWA 应用。

## 目录特点

本版本为了方便 GitHub 网页上传，所有核心文件都在同一级根目录：

```text
index.html
styles.css
main.js
utils.js
models.js
db.js
highlight.js
codeEditor.js
homeView.js
editView.js
previewView.js
manifest.json
service-worker.js
vercel.json
icon.svg
README.md
.gitignore
```

没有 `src/`、`styles/`、`icons/` 多层文件夹，方便一次性全选上传。

## 功能

- 主页题库列表
- 新建、编辑、删除代码题
- 题目图片导入、拖拽导入、粘贴截图导入
- 题目文字为空时，预览页不显示空占位
- 题图在预览页占满宽度，清晰展示
- 多方法代码管理
- 每个方法支持备注
- 每个方法支持 HTML 动画演示
- 代码编辑器优先加载 Monaco Editor，接近 VSCode 体验
- Monaco 加载失败时自动切换内置编辑器
- IndexedDB 本地大容量存储
- 题库 JSON 导入/导出
- PWA，可在 Chrome 中安装为本地应用

## GitHub 网页上传方法

1. 解压 ZIP。
2. 打开解压后的文件夹。
3. 全选里面所有文件。
4. GitHub 仓库页面点击 `Add file -> Upload files`。
5. 把所有文件拖进去。
6. 点击 `Commit changes`。

## Vercel 部署

1. Vercel 导入 GitHub 仓库。
2. Framework Preset 选 `Other`。
3. Build Command 留空。
4. Output Directory 留空或填 `.`。
5. Deploy。

## 本地运行

直接双击 `index.html` 可以打开，但 PWA 和 Service Worker 更推荐通过 Vercel 或本地静态服务器访问。

本地服务器方式：

```bash
python -m http.server 5173
```

然后浏览器打开：

```text
http://localhost:5173
```
