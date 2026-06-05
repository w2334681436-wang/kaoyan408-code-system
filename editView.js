import { escapeHtml } from "./utils.js";
import { getActiveMethod } from "./models.js";

export function renderEdit(container, problem) {
  const method = getActiveMethod(problem);
  container.innerHTML = `
    <main class="main">
      <div class="edit-layout">
        <aside class="panel scroll-panel">
          <div class="panel-head">
            <div class="panel-title">题目信息</div>
            <button class="btn small" id="previewFromEditBtn">预览</button>
          </div>
          <div class="panel-body">
            <div class="form-grid">
              <div>
                <div class="label">题目标题</div>
                <input id="titleInput" style="width:100%" value="${escapeHtml(problem.title || "")}" placeholder="例如：循环左移 / 银行家算法 / 二叉树遍历" />
              </div>
              <div class="two">
                <div>
                  <div class="label">类型</div>
                  <select id="typeInput" style="width:100%">
                    ${["数据结构","操作系统","计算机组成原理","计算机网络","综合代码题"].map(x => `<option ${problem.type === x ? "selected" : ""}>${x}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <div class="label">难度</div>
                  <select id="difficultyInput" style="width:100%">
                    ${["基础","中等","偏难","压轴"].map(x => `<option ${problem.difficulty === x ? "selected" : ""}>${x}</option>`).join("")}
                  </select>
                </div>
              </div>
              <div>
                <div class="label">标签</div>
                <input id="tagsInput" style="width:100%" value="${escapeHtml((problem.tags || []).join(", "))}" placeholder="用逗号分隔，如：链表,递归,408" />
              </div>
              <div>
                <div class="label">题目文字</div>
                <textarea id="questionInput" rows="7" style="width:100%" placeholder="有文字就写；只有题图也可以。预览页不会显示空占位文字。">${escapeHtml(problem.questionText || "")}</textarea>
              </div>
              <div>
                <div class="label">题目图片</div>
                <div class="dropzone" id="dropzone">
                  点击导入图片，或拖拽/粘贴截图到页面<br/>
                  <span class="help">预览页会让题图占满宽度，保证清晰可看。</span>
                </div>
                <input type="file" id="imageInput" class="hide" accept="image/*" multiple />
                <div id="imageList" class="image-list">
                  ${(problem.images || []).map((img, idx) => `
                    <div class="image-card">
                      <img src="${img.dataUrl}" data-img-index="${idx}" alt="${escapeHtml(img.name || "题图")}" />
                      <button class="btn small" data-delete-image="${idx}">删除</button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <div class="side-section">
                <div class="row gap" style="justify-content:space-between;margin-bottom:10px">
                  <div class="panel-title">代码方法</div>
                  <button class="btn small primary" id="addMethodBtn">＋ 方法</button>
                </div>
                <div id="methodsList" class="methods">
                  ${(problem.methods || []).map((m, idx) => `
                    <div class="method-item ${m.id === problem.activeMethodId ? "active" : ""}" data-method-id="${m.id}">
                      <div style="min-width:0">
                        <div class="method-name">${idx + 1}. ${escapeHtml(m.name || "未命名方法")}</div>
                        <div class="method-lang">${escapeHtml(m.language || "cpp")} · ${(m.code || "").split("\n").length} 行</div>
                      </div>
                      <button class="btn small" data-open-method="${m.id}">打开</button>
                    </div>
                  `).join("")}
                </div>
              </div>

              <div class="side-section">
                <button class="btn danger" id="deleteProblemBtn" style="width:100%">删除当前题目</button>
                <p class="help">
                  快捷键：<span class="kbd">Ctrl</span> + <span class="kbd">S</span> 保存，
                  <span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> 预览。
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section class="editor-column">
          <div class="method-toolbar">
            <input id="methodNameInput" value="${escapeHtml(method.name || "")}" placeholder="方法名，如：考场写法 / 递归写法 / 非递归写法" />
            <select id="languageInput">
              ${[
                ["cpp","C/C++"],["c","C"],["python","Python"],["java","Java"],["js","JavaScript"],["pseudo","伪代码"]
              ].map(([value, label]) => `<option value="${value}" ${method.language === value ? "selected" : ""}>${label}</option>`).join("")}
            </select>
            <button class="btn small" id="duplicateMethodBtn">复制方法</button>
            <button class="btn small danger" id="deleteMethodBtn">删方法</button>
            <div class="editor-tabs">
              <button class="btn small tab-btn active" data-tab="code">代码</button>
              <button class="btn small tab-btn" data-tab="note">备注</button>
              <button class="btn small tab-btn" data-tab="html">HTML动画</button>
            </div>
            <span class="status" id="saveStatus">已加载</span>
          </div>

          <div id="codePanel" class="tab-panel"><div id="codeEditorRoot" style="height:100%"></div></div>
          <div id="notePanel" class="tab-panel hide">
            <textarea id="noteInput" class="note-editor" placeholder="写本方法的思路、易错点、时间复杂度、考场注意事项。">${escapeHtml(method.note || "")}</textarea>
          </div>
          <div id="htmlPanel" class="tab-panel hide">
            <textarea id="htmlDemoInput" class="html-editor" placeholder="给当前方法添加 HTML 动画演示代码，预览页可运行。">${escapeHtml(method.htmlDemo || "")}</textarea>
          </div>
        </section>
      </div>
    </main>
  `;
}
