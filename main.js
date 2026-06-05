import { $, $$, now, uid, toast, fileToDataUrl, downloadText, safeJsonParse, copyText, showImage, closeImage, requestFullScreen, stripHighlightMarkup } from "./utils.js";
import { initDB, getAllProblems, getProblem, saveProblem, deleteProblem, importProblems } from "./db.js";
import { createProblem, createMethod, getActiveMethod, normalizeProblem } from "./models.js";
import { renderHome } from "./homeView.js";
import { renderEdit } from "./editView.js";
import { renderPreview, updatePreviewMethod } from "./previewView.js";
import { CodeEditor } from "./codeEditor.js";

const app = $("#app");

let state = {
  view: "home",
  problems: [],
  current: null,
  search: "",
  sort: "updatedDesc",
  tag: "",
  editor: null,
  saveTimer: null,
  isSaving: false
};

function shell(content = "") {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">
          <div class="brand-logo">408</div>
          <div>
            考研408代码题系统
            <small>v4 · GitHub/Vercel/PWA · 预览高亮修复 · HTML动画保存修复</small>
          </div>
        </div>
        <div class="top-actions">
          <button class="btn ghost small" id="homeBtn">主页</button>
          <button class="btn primary small" id="topNewBtn">新建题目</button>
          <button class="btn small" id="exportBtn">导出题库</button>
          <button class="btn small" id="importBtn">导入题库</button>
          <input type="file" id="importFile" class="hide" accept=".json,application/json" />
        </div>
      </header>
      <div id="viewRoot">${content}</div>
    </div>
  `;
  bindShellEvents();
}

function bindShellEvents() {
  $("#homeBtn").onclick = () => openHome();
  $("#topNewBtn").onclick = () => newProblem();
  $("#exportBtn").onclick = () => exportAll();
  $("#importBtn").onclick = () => $("#importFile").click();
  $("#importFile").onchange = event => {
    const file = event.target.files?.[0];
    if (file) importFile(file);
  };
}

async function loadProblems() {
  state.problems = await getAllProblems();
  state.problems.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

async function openHome() {
  await saveCurrentIfNeeded();
  await loadProblems();
  state.view = "home";
  state.current = null;
  state.editor = null;
  document.onpaste = null;
  document.onkeydown = null;
  shell();
  renderHome($("#viewRoot"), state);
  bindHomeEvents();
  bindGlobalModals();
}

function bindHomeEvents() {
  $("#newProblemBtn").onclick = () => newProblem();
  $("#seedBtn").onclick = () => createSeed();
  $("#searchInput").oninput = event => {
    state.search = event.target.value;
    renderHome($("#viewRoot"), state);
    bindHomeEvents();
  };
  $("#sortSelect").onchange = event => {
    state.sort = event.target.value;
    renderHome($("#viewRoot"), state);
    bindHomeEvents();
  };
  $("#tagFilter").onchange = event => {
    state.tag = event.target.value;
    renderHome($("#viewRoot"), state);
    bindHomeEvents();
  };
  $$(".card").forEach(card => {
    card.onclick = () => openPreview(card.dataset.id);
  });
}

async function newProblem() {
  const p = createProblem();
  p.updatedAt = now();
  await saveProblem(p);
  await loadProblems();
  await openEdit(p.id);
}

async function createSeed() {
  const p = createProblem();
  p.title = "示例：顺序表循环左移 p 位";
  p.type = "数据结构";
  p.difficulty = "中等";
  p.tags = ["408", "顺序表", "数组", "循环左移"];
  p.questionText = "设将 n 个整数存放在一维数组 R 中。设计一个在时间和空间两方面都尽可能高效的算法，将 R 中保存的序列循环左移 p 个位置。";
  const m = getActiveMethod(p);
  m.name = "方法一：三次逆置";
  m.language = "cpp";
  m.code = `void reverse(int R[], int left, int right) {
    while (left < right) {
        int t = R[left];
        R[left] = R[right];
        R[right] = t;
        left++;
        right--;
    }
}

void leftRotate(int R[], int n, int p) {
    p = p % n;
    reverse(R, 0, p - 1);
    reverse(R, p, n - 1);
    reverse(R, 0, n - 1);
}`;
  m.note = "考场条件反射：数组循环左移 p 位，优先想“三次逆置”。先逆置前 p 个，再逆置后 n-p 个，最后整体逆置。时间 O(n)，空间 O(1)。";
  m.htmlDemo = String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",Arial,sans-serif;color:#111827}
.box{width:min(900px,94vw);background:white;border:1px solid #e5e7eb;border-radius:24px;padding:28px;box-shadow:0 20px 50px rgba(15,23,42,.08)}
.arr{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0}.cell{width:58px;height:58px;border-radius:16px;border:1px solid #bfdbfe;background:#eff6ff;display:grid;place-items:center;font-weight:900}
button{border:0;border-radius:12px;background:#2563eb;color:white;padding:10px 14px;cursor:pointer}p{color:#64748b;line-height:1.8}
</style>
</head>
<body>
<div class="box">
<h1>三次逆置实现循环左移</h1>
<p id="msg">初始数组：左移 3 位</p>
<div class="arr" id="arr"></div>
<button onclick="next()">下一步</button>
</div>
<script>
let steps=[
  {msg:"初始数组", a:["a","b","c","d","e","f","g"]},
  {msg:"逆置前 p 个：c b a d e f g", a:["c","b","a","d","e","f","g"]},
  {msg:"逆置后 n-p 个：c b a g f e d", a:["c","b","a","g","f","e","d"]},
  {msg:"整体逆置：d e f g a b c，完成左移 3 位", a:["d","e","f","g","a","b","c"]}
], i=0;
function draw(){msg.textContent=steps[i].msg;arr.innerHTML=steps[i].a.map(x=>'<div class="cell">'+x+'</div>').join('')}
function next(){i=Math.min(i+1,steps.length-1);draw()}
draw()
</script>
</body>
</html>`;
  await saveProblem(p);
  await loadProblems();
  await openPreview(p.id);
  toast("已生成示例题");
}

async function openEdit(id) {
  await saveCurrentIfNeeded();
  const p = await getProblem(id);
  if (!p) return toast("题目不存在");
  state.current = normalizeProblem(p);
  state.view = "edit";
  shell();
  renderEdit($("#viewRoot"), state.current);
  bindEditEvents();
  initCodeEditor();
  bindGlobalModals();
}

function initCodeEditor() {
  const method = getActiveMethod(state.current);
  state.editor = new CodeEditor($("#codeEditorRoot"), (_value, action) => {
    syncEditFormToState();
    if (action === "save") saveCurrentIfNeeded(true);
    else scheduleSave();
  });
  state.editor.setLanguage(method.language);
  state.editor.setValue(stripHighlightMarkup(method.code || ""));
}

function bindEditEvents() {
  const ids = ["titleInput", "typeInput", "difficultyInput", "tagsInput", "questionInput", "methodNameInput", "languageInput", "noteInput", "htmlDemoInput"];
  ids.forEach(id => {
    const el = $("#" + id);
    if (!el) return;
    el.addEventListener("input", () => {
      if (id === "languageInput") state.editor?.setLanguage(el.value);
      syncEditFormToState();
      scheduleSave();
    });
    el.addEventListener("change", () => {
      if (id === "languageInput") state.editor?.setLanguage(el.value);
      syncEditFormToState();
      scheduleSave();
    });
    el.addEventListener("blur", () => saveCurrentIfNeeded());
  });

  $("#manualSaveBtn").onclick = () => saveCurrentIfNeeded(true);

  $$(".tab-btn").forEach(btn => {
    btn.onclick = async () => {
      syncEditFormToState();
      await saveCurrentIfNeeded();
      $$(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
      $("#codePanel").classList.toggle("hide", btn.dataset.tab !== "code");
      $("#notePanel").classList.toggle("hide", btn.dataset.tab !== "note");
      $("#htmlPanel").classList.toggle("hide", btn.dataset.tab !== "html");
    };
  });

  $("#previewFromEditBtn").onclick = async () => {
    await saveCurrentIfNeeded(true);
    openPreview(state.current.id);
  };
  $("#addMethodBtn").onclick = () => addMethod();
  $("#duplicateMethodBtn").onclick = () => duplicateMethod();
  $("#deleteMethodBtn").onclick = () => removeMethod();
  $("#deleteProblemBtn").onclick = () => removeCurrentProblem();

  $$(".method-item").forEach(item => {
    item.onclick = async () => {
      syncEditFormToState();
      await saveCurrentIfNeeded(true);
      state.current.activeMethodId = item.dataset.methodId;
      await saveProblem(state.current);
      openEdit(state.current.id);
    };
  });

  $("#dropzone").onclick = () => $("#imageInput").click();
  $("#imageInput").onchange = event => addImages(event.target.files);
  $("#dropzone").ondragover = event => {
    event.preventDefault();
    $("#dropzone").classList.add("drag");
  };
  $("#dropzone").ondragleave = () => $("#dropzone").classList.remove("drag");
  $("#dropzone").ondrop = event => {
    event.preventDefault();
    $("#dropzone").classList.remove("drag");
    addImages(event.dataTransfer.files);
  };
  $$("[data-delete-image]").forEach(btn => {
    btn.onclick = event => {
      event.stopPropagation();
      state.current.images.splice(Number(btn.dataset.deleteImage), 1);
      saveProblem(state.current).then(() => openEdit(state.current.id));
    };
  });
  $$("[data-img-index]").forEach(img => {
    img.onclick = () => showImage(state.current.images[Number(img.dataset.imgIndex)].dataUrl);
  });

  document.onpaste = event => {
    if (state.view !== "edit") return;
    const files = [];
    for (const item of event.clipboardData?.items || []) {
      if (item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) addImages(files);
  };

  document.onkeydown = event => {
    if (state.view !== "edit") return;
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      saveCurrentIfNeeded(true).then(() => openPreview(state.current.id));
    }
  };

  window.onbeforeunload = () => {
    if (state.view === "edit") syncEditFormToState();
  };
}

function syncEditFormToState() {
  if (!state.current) return;
  const p = state.current;
  const titleInput = $("#titleInput");
  if (!titleInput) return;

  p.title = titleInput.value.trim() || "未命名代码题";
  p.type = $("#typeInput")?.value || "数据结构";
  p.difficulty = $("#difficultyInput")?.value || "中等";
  p.tags = ($("#tagsInput")?.value || "").split(/[,，]/).map(s => s.trim()).filter(Boolean);
  p.questionText = $("#questionInput")?.value || "";
  const m = getActiveMethod(p);
  m.name = $("#methodNameInput")?.value.trim() || "未命名方法";
  m.language = $("#languageInput")?.value || "cpp";
  m.code = stripHighlightMarkup(state.editor?.getValue() ?? m.code ?? "");
  m.note = $("#noteInput")?.value || "";
  const htmlTextarea = $("#htmlDemoInput");
  if (htmlTextarea) m.htmlDemo = htmlTextarea.value;
  p.updatedAt = now();
}

function scheduleSave() {
  clearTimeout(state.saveTimer);
  const status = $("#saveStatus");
  if (status) status.textContent = "保存中...";
  state.saveTimer = setTimeout(() => saveCurrentIfNeeded(), 500);
}

async function saveCurrentIfNeeded(show = false) {
  if (!state.current || state.isSaving) return;
  const canSync = state.view === "edit" && $("#titleInput");
  if (canSync) syncEditFormToState();
  normalizeProblem(state.current);
  state.isSaving = true;
  try {
    await saveProblem(state.current);
    const status = $("#saveStatus");
    if (status) status.textContent = "已保存 " + new Date().toLocaleTimeString("zh-CN", { hour12: false });
    if (show) toast("已保存");
  } finally {
    state.isSaving = false;
  }
}

async function addImages(fileList) {
  const files = Array.from(fileList || []).filter(file => file.type.startsWith("image/"));
  if (!files.length) return;
  for (const file of files) {
    state.current.images.push({
      id: uid(),
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl: await fileToDataUrl(file)
    });
  }
  await saveProblem(state.current);
  await openEdit(state.current.id);
  toast(`已导入 ${files.length} 张图片`);
}

async function addMethod() {
  await saveCurrentIfNeeded(true);
  const method = createMethod(`方法${state.current.methods.length + 1}`);
  state.current.methods.push(method);
  state.current.activeMethodId = method.id;
  await saveProblem(state.current);
  await openEdit(state.current.id);
}

async function duplicateMethod() {
  await saveCurrentIfNeeded(true);
  const old = getActiveMethod(state.current);
  const copy = structuredClone(old);
  copy.id = uid();
  copy.name = `${old.name || "方法"} 副本`;
  copy.createdAt = now();
  state.current.methods.push(copy);
  state.current.activeMethodId = copy.id;
  await saveProblem(state.current);
  await openEdit(state.current.id);
}

async function removeMethod() {
  if (state.current.methods.length <= 1) return toast("至少保留一个方法");
  if (!confirm("确定删除当前方法吗？")) return;
  state.current.methods = state.current.methods.filter(m => m.id !== state.current.activeMethodId);
  state.current.activeMethodId = state.current.methods[0].id;
  await saveProblem(state.current);
  await openEdit(state.current.id);
}

async function removeCurrentProblem() {
  if (!confirm("确定删除当前题目？此操作不可撤销。")) return;
  await deleteProblem(state.current.id);
  state.current = null;
  await openHome();
  toast("已删除题目");
}

async function openPreview(id) {
  await saveCurrentIfNeeded(true);
  const p = await getProblem(id);
  if (!p) return toast("题目不存在");
  state.current = normalizeProblem(p);
  // 读出来后立刻保存一次，自动清洗旧 span 污染代码。
  await saveProblem(state.current);
  state.view = "preview";
  document.onpaste = null;
  document.onkeydown = null;
  shell();
  renderPreview($("#viewRoot"), state.current);
  bindPreviewEvents();
  bindGlobalModals();
}

function bindPreviewEvents() {
  $("#previewMethodSelect").onchange = event => {
    state.current.activeMethodId = event.target.value;
    updatePreviewMethod(state.current);
  };
  $("#toggleNoteBtn").onclick = () => $("#notePreview").classList.toggle("hide");
  $("#runDemoBtn").onclick = () => runDemo();
  $("#copyCodeBtn").onclick = async () => {
    await copyText(stripHighlightMarkup(getActiveMethod(state.current).code || ""));
    toast("已复制代码");
  };
  $("#fullscreenBtn").onclick = () => requestFullScreen($("#previewFullTarget"));
  $("#editFromPreviewBtn").onclick = () => openEdit(state.current.id);
  $$("[data-preview-image]").forEach(img => {
    img.onclick = () => showImage(state.current.images[Number(img.dataset.previewImage)].dataUrl);
  });
}

function runDemo() {
  const method = getActiveMethod(state.current);
  if (!method.htmlDemo?.trim()) return toast("当前方法没有 HTML 动画代码");
  $("#demoModalTitle").textContent = `${method.name || "当前方法"} · HTML 动画演示`;
  $("#demoFrame").srcdoc = method.htmlDemo;
  $("#demoModal").classList.add("open");
}

async function exportAll() {
  await saveCurrentIfNeeded(true);
  await loadProblems();
  downloadText(
    `考研408代码题库_${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify({ version: 4, exportedAt: now(), problems: state.problems }, null, 2)
  );
  toast("已导出题库");
}

async function importFile(file) {
  const text = await file.text();
  const [data, error] = safeJsonParse(text);
  if (error) return toast("JSON 文件格式错误");
  const list = Array.isArray(data) ? data : data.problems;
  if (!Array.isArray(list)) return toast("没有识别到题库数组");
  const replace = confirm("确定=替换当前题库；取消=合并导入。");
  const count = await importProblems(list, replace);
  await openHome();
  toast(`已导入 ${count} 道题`);
}


async function repairAllDirtyCodes() {
  const list = await getAllProblems();
  let changed = 0;

  for (const problem of list) {
    let dirty = false;
    normalizeProblem(problem);

    for (const method of problem.methods || []) {
      const before = String(method.code || "");
      const after = stripHighlightMarkup(before);
      if (before !== after) {
        method.code = after;
        dirty = true;
      }
    }

    if (dirty) {
      problem.updatedAt = now();
      await saveProblem(problem);
      changed++;
    }
  }

  if (changed > 0) {
    toast(`已自动修复 ${changed} 道题的代码预览乱码`);
  }
}

function bindGlobalModals() {
  const closeImageButton = $("#closeImageModal");
  if (closeImageButton) closeImageButton.onclick = closeImage;
  const imageModal = $("#imageModal");
  if (imageModal) {
    imageModal.onclick = event => {
      if (event.target.id === "imageModal") closeImage();
    };
  }
  const closeDemoButton = $("#closeDemoModal");
  if (closeDemoButton) {
    closeDemoButton.onclick = () => {
      $("#demoModal").classList.remove("open");
      $("#demoFrame").srcdoc = "";
    };
  }
  const demoModal = $("#demoModal");
  if (demoModal) {
    demoModal.onclick = event => {
      if (event.target.id === "demoModal") $("#closeDemoModal").click();
    };
  }
  const demoFullscreenButton = $("#demoFullscreenBtn");
  if (demoFullscreenButton) demoFullscreenButton.onclick = () => requestFullScreen($("#demoFrame"));
}

async function start() {
  shell(`<main class="main"><p class="muted">正在加载...</p></main>`);
  bindGlobalModals();
  await initDB();
  await repairAllDirtyCodes();

  if ("serviceWorker" in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) await reg.update();
      await navigator.serviceWorker.register("./service-worker.js?v=4", { scope: "./" });
    } catch (error) {
      console.warn("Service Worker 注册失败", error);
    }
  }

  await openHome();
  bindGlobalModals();
}

start().catch(error => {
  console.error(error);
  app.innerHTML = `<main class="main"><h2>启动失败</h2><pre>${String(error?.stack || error)}</pre></main>`;
});
