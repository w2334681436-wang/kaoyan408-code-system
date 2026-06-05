import { escapeHtml, formatDate } from "./utils.js";
import { getActiveMethod } from "./models.js";
import { highlightCode } from "./highlight.js";

export function renderPreview(container, problem) {
  const method = getActiveMethod(problem);
  const hasQuestionText = Boolean((problem.questionText || "").trim());
  container.innerHTML = `
    <main class="main">
      <div class="preview-wrap full-target" id="previewFullTarget">
        <section class="preview-panel">
          <div class="preview-head">
            <div class="preview-title">
              <h2>${escapeHtml(problem.title || "未命名代码题")}</h2>
              <div>${escapeHtml(problem.type || "代码题")} · ${escapeHtml(problem.difficulty || "中等")} · ${(problem.tags || []).map(escapeHtml).join(" / ")} · 更新 ${formatDate(problem.updatedAt)}</div>
            </div>
            <div class="top-actions">
              <select id="previewMethodSelect">
                ${(problem.methods || []).map(m => `<option value="${m.id}" ${m.id === problem.activeMethodId ? "selected" : ""}>${escapeHtml(m.name || "未命名方法")}</option>`).join("")}
              </select>
              <button class="btn small" id="toggleNoteBtn">备注</button>
              <button class="btn small" id="runDemoBtn">运行动画</button>
              <button class="btn small" id="copyCodeBtn">复制代码</button>
              <button class="btn small" id="fullscreenBtn">全屏</button>
              <button class="btn primary small" id="editFromPreviewBtn">编写</button>
            </div>
          </div>
          <div class="preview-body">
            ${(hasQuestionText || (problem.images || []).length) ? `
              <div class="question-box">
                <div class="label">题目</div>
                ${hasQuestionText ? `<div class="question-text">${escapeHtml(problem.questionText)}</div>` : ""}
                ${(problem.images || []).length ? `
                  <div class="preview-images" style="${hasQuestionText ? "margin-top:16px" : ""}">
                    ${(problem.images || []).map((img, idx) => `<img src="${img.dataUrl}" data-preview-image="${idx}" alt="${escapeHtml(img.name || "题图")}" />`).join("")}
                  </div>
                ` : ""}
              </div>
            ` : ""}
            ${methodBlock(method)}
            <div id="notePreview" class="note-preview hide">${escapeHtml(method.note || "暂无备注。")}</div>
          </div>
        </section>
      </div>
    </main>
  `;
}

export function methodBlock(method) {
  return `
    <div class="code-preview">
      <div class="code-preview-head">
        <span id="previewCodeTitle">${escapeHtml(method.name || "代码")}</span>
        <span id="previewCodeInfo">${escapeHtml(method.language || "cpp")} · ${(method.code || "").split("\n").length} 行</span>
      </div>
      <pre><code id="previewCode">${highlightCode(method.code || "", method.language || "cpp")}</code></pre>
    </div>
  `;
}

export function updatePreviewMethod(problem) {
  const method = getActiveMethod(problem);
  const old = document.querySelector(".code-preview");
  if (old) old.outerHTML = methodBlock(method);
  const note = document.querySelector("#notePreview");
  if (note) {
    note.textContent = method.note || "暂无备注。";
    note.classList.add("hide");
  }
}
