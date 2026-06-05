import { escapeHtml, formatDate } from "./utils.js";

export function renderHome(container, state) {
  const { problems, search = "", sort = "updatedDesc", tag = "" } = state;
  const allTags = [...new Set(problems.flatMap(p => p.tags || []))].filter(Boolean).sort((a, b) => a.localeCompare(b, "zh-CN"));

  let list = [...problems];
  if (tag) list = list.filter(p => (p.tags || []).includes(tag));
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p => {
      const methods = (p.methods || []).map(m => `${m.name} ${m.language} ${m.code} ${m.note} ${m.htmlDemo}`).join(" ");
      const text = `${p.title} ${p.type} ${p.difficulty} ${(p.tags || []).join(" ")} ${p.questionText} ${methods}`.toLowerCase();
      return text.includes(q);
    });
  }

  list.sort((a, b) => {
    if (sort === "titleAsc") return (a.title || "").localeCompare(b.title || "", "zh-CN");
    if (sort === "createdDesc") return (b.createdAt || "").localeCompare(a.createdAt || "");
    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  });

  container.innerHTML = `
    <main class="main">
      <div class="home-wrap">
        <section class="hero">
          <div>
            <h1>考研408代码题系统</h1>
            <p>主页就是题库列表。题目图片、代码、多方法、备注、HTML 动画演示都保存在浏览器本地 IndexedDB，可导入导出备份。</p>
          </div>
          <div class="top-actions">
            <button class="btn primary" id="newProblemBtn">＋ 新建题目</button>
            <button class="btn" id="seedBtn">生成示例</button>
          </div>
        </section>

        <div class="search-row">
          <input id="searchInput" value="${escapeHtml(search)}" placeholder="搜索题目、标签、代码、备注、HTML动画..." />
          <select id="sortSelect">
            <option value="updatedDesc" ${sort === "updatedDesc" ? "selected" : ""}>最近更新</option>
            <option value="createdDesc" ${sort === "createdDesc" ? "selected" : ""}>最近创建</option>
            <option value="titleAsc" ${sort === "titleAsc" ? "selected" : ""}>标题 A-Z</option>
          </select>
          <select id="tagFilter">
            <option value="">全部标签</option>
            ${allTags.map(t => `<option value="${escapeHtml(t)}" ${tag === t ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}
          </select>
        </div>

        <p class="help">共 ${problems.length} 道题，当前显示 ${list.length} 道。v4 已修复 PWA 启动、预览代码高亮污染、HTML 动画保存。</p>

        ${list.length ? `
          <div class="cards">
            ${list.map(p => cardTemplate(p)).join("")}
          </div>
        ` : `
          <div class="empty">
            <h2>还没有题目</h2>
            <p>点击“新建题目”，把题目截图、代码方法、备注和动画演示存进本地题库。</p>
          </div>
        `}
      </div>
    </main>
  `;
}

function cardTemplate(p) {
  const methodCount = p.methods?.length || 0;
  const imageCount = p.images?.length || 0;
  const desc = p.questionText || "已保存题目图片或代码，可打开查看。";
  const tags = (p.tags || []).slice(0, 4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  return `
    <article class="card" data-id="${p.id}">
      <h3>${escapeHtml(p.title || "未命名代码题")}</h3>
      <div class="card-desc">${escapeHtml(desc)}</div>
      <div class="meta">
        <span class="tag blue">${escapeHtml(p.type || "代码题")}</span>
        <span class="tag orange">${escapeHtml(p.difficulty || "中等")}</span>
        <span class="tag green">${methodCount} 方法</span>
        <span class="tag">${imageCount} 图</span>
        ${tags}
      </div>
      <div class="help">更新：${formatDate(p.updatedAt)}</div>
    </article>
  `;
}
