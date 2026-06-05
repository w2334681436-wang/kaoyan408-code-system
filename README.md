# 考研408代码题系统 v4

这是适合 GitHub 网页上传 + Vercel 部署 + Chrome 安装为 PWA 的扁平模块版。

## v4 修复

1. 修复 PWA 安装后从桌面/启动器直接打开失败的问题。
   - `manifest.json` 的 `start_url` 改为 `./?source=pwa-v4`
   - `service-worker.js` 对导航请求做网络优先 + index 回退
   - 更新缓存版本，避免旧缓存继续污染

2. 修复预览页代码显示 `<span class="tok-xxx">` 的问题。
   - 自动清洗旧数据中已经被污染的高亮标签
   - 新保存的代码只保存纯代码，不保存高亮 HTML

3. 修复 HTML 动画代码保存不稳定的问题。
   - 添加“立即保存”按钮
   - 切换标签、预览、回主页、导出前都会强制保存
   - HTML 动画 textarea 单独同步保存，不再丢失

## 文件结构

所有文件在同一级目录，方便 GitHub 一次性上传：

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

## 上传 GitHub

1. 解压 ZIP。
2. 打开解压后的文件夹。
3. 全选里面所有文件。
4. GitHub 仓库页面点击 `Add file -> Upload files`。
5. 拖入所有文件。
6. 点击 `Commit changes`。

## Vercel 部署

1. Vercel 导入 GitHub 仓库。
2. Framework Preset 选 `Other`。
3. Build Command 留空。
4. Output Directory 留空或填 `.`。
5. Deploy。

## 重要：安装过旧版 PWA 的处理

如果你之前已经在 Chrome 安装过旧版应用，部署 v4 后建议：

1. 先删除旧的已安装应用。
2. 打开新的 Vercel 链接。
3. 刷新两次。
4. 再重新点击 Chrome 地址栏安装。

旧版 PWA 的启动地址可能还停留在 `/index.html`，重新安装后会使用 v4 的 `./?source=pwa-v4`。
