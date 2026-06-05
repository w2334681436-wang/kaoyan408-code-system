import { $, $$, toast } from "./utils.js";
import { highlightCode } from "./highlight.js";

const MONACO_CDN = "https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs";

const langMap = {
  cpp: "cpp",
  c: "c",
  python: "python",
  java: "java",
  js: "javascript",
  pseudo: "plaintext"
};

function indentCode(code) {
  const lines = String(code ?? "").split("\n");
  let level = 0;
  const out = [];
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) {
      out.push("");
      continue;
    }
    if (/^[}\])]/.test(line)) level = Math.max(0, level - 1);
    out.push("    ".repeat(level) + line);
    const open = (line.match(/[{\[(]/g) || []).length;
    const close = (line.match(/[}\])]/g) || []).length;
    level = Math.max(0, level + open - close);
  }
  return out.join("\n");
}

function snippets() {
  return [
    { label: "main", code: "#include <bits/stdc++.h>\\nusing namespace std;\\n\\nint main() {\\n    \\n    return 0;\\n}" },
    { label: "for", code: "for (int i = 0; i < n; i++) {\\n    \\n}" },
    { label: "while", code: "while () {\\n    \\n}" },
    { label: "if", code: "if () {\\n    \\n}" },
    { label: "struct", code: "typedef struct LNode {\\n    int data;\\n    struct LNode *next;\\n} LNode;" },
    { label: "链表遍历", code: "for (LNode *p = L->next; p != NULL; p = p->next) {\\n    \\n}" },
    { label: "二叉树递归", code: "void visit(BiTree T) {\\n    if (T == NULL) return;\\n    visit(T->lchild);\\n    visit(T->rchild);\\n}" },
    { label: "BFS", code: "queue<int> q;\\nq.push(s);\\nvis[s] = true;\\nwhile (!q.empty()) {\\n    int u = q.front(); q.pop();\\n    for (int v : g[u]) {\\n        if (!vis[v]) {\\n            vis[v] = true;\\n            q.push(v);\\n        }\\n    }\\n}" },
    { label: "DFS", code: "void dfs(int u) {\\n    vis[u] = true;\\n    for (int v : g[u]) {\\n        if (!vis[v]) dfs(v);\\n    }\\n}" }
  ];
}

async function loadMonaco() {
  if (window.monaco) return window.monaco;

  if (!window.require) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${MONACO_CDN}/loader.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return await new Promise((resolve, reject) => {
    window.require.config({ paths: { vs: MONACO_CDN } });
    window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
  });
}

export class CodeEditor {
  constructor(root, onChange = () => {}) {
    this.root = root;
    this.onChange = onChange;
    this.language = "cpp";
    this.value = "";
    this.monaco = null;
    this.editor = null;
    this.fallback = null;
    this.render();
    this.init();
  }

  render() {
    this.root.innerHTML = `
      <div class="editor-shell">
        <div class="editor-tools">
          <button class="btn small" data-action="format">整理缩进</button>
          <button class="btn small" data-action="wrap">自动换行</button>
          <button class="btn small" data-action="fontMinus">A-</button>
          <button class="btn small" data-action="fontPlus">A+</button>
          <span class="help">Tab 缩进 · 括号补全 · Ctrl+/ 注释 · Ctrl+S 保存 · Ctrl+Space 提示</span>
          <span class="status" id="editorMode">编辑器加载中...</span>
          <div class="row gap" style="margin-left:auto">
            ${snippets().slice(0, 6).map(s => `<button class="btn small" data-snippet="${s.label}">${s.label}</button>`).join("")}
          </div>
        </div>
        <div class="monaco-box" id="monacoBox"></div>
      </div>
    `;
    this.box = $("#monacoBox", this.root);
    this.modeEl = $("#editorMode", this.root);
    $("[data-action='format']", this.root).onclick = () => this.setValue(indentCode(this.getValue()));
    $("[data-action='wrap']", this.root).onclick = () => this.toggleWrap();
    $("[data-action='fontMinus']", this.root).onclick = () => this.changeFont(-1);
    $("[data-action='fontPlus']", this.root).onclick = () => this.changeFont(1);
    $$("[data-snippet]", this.root).forEach(btn => {
      btn.onclick = () => this.insertSnippet(btn.dataset.snippet);
    });
  }

  async init() {
    try {
      this.monaco = await loadMonaco();
      this.editor = this.monaco.editor.create(this.box, {
        value: this.value,
        language: langMap[this.language] || "cpp",
        theme: "vs",
        fontFamily: '"Cascadia Code","JetBrains Mono","SFMono-Regular","Consolas","Liberation Mono",monospace',
        fontSize: 15,
        lineHeight: 24,
        minimap: { enabled: false },
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        wordWrap: "off",
        scrollBeyondLastLine: false,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true },
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        parameterHints: { enabled: true }
      });
      this.editor.onDidChangeModelContent(() => {
        this.value = this.editor.getValue();
        this.onChange(this.value);
      });
      this.editor.addAction({
        id: "save-problem",
        label: "保存题目",
        keybindings: [this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyS],
        run: () => {
          this.onChange(this.getValue(), "save");
          toast("已触发保存");
        }
      });
      this.modeEl.textContent = "Monaco Editor";
    } catch (error) {
      console.warn("Monaco 加载失败，使用内置编辑器", error);
      this.createFallback();
      this.modeEl.textContent = "内置编辑器";
    }
  }

  createFallback() {
    this.box.innerHTML = `
      <div class="fallback-editor">
        <pre class="gutter"></pre>
        <div class="editor-stack">
          <pre class="highlight"><code></code></pre>
          <textarea class="code-input" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
        </div>
      </div>
    `;
    this.fallback = {
      gutter: $(".gutter", this.box),
      highlight: $(".highlight code", this.box),
      pre: $(".highlight", this.box),
      textarea: $(".code-input", this.box)
    };
    const ta = this.fallback.textarea;
    ta.value = this.value;
    ta.addEventListener("input", () => {
      this.value = ta.value;
      this.updateFallback();
      this.onChange(this.value);
    });
    ta.addEventListener("scroll", () => {
      this.fallback.pre.scrollTop = ta.scrollTop;
      this.fallback.pre.scrollLeft = ta.scrollLeft;
      this.fallback.gutter.scrollTop = ta.scrollTop;
    });
    ta.addEventListener("keydown", event => this.handleFallbackKey(event));
    this.updateFallback();
  }

  updateFallback() {
    if (!this.fallback) return;
    const value = this.fallback.textarea.value;
    this.fallback.highlight.innerHTML = highlightCode(value, this.language);
    const count = Math.max(1, value.split("\n").length);
    this.fallback.gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join("\n");
  }

  handleFallbackKey(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      this.insertText("    ");
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      this.onChange(this.getValue(), "save");
      toast("已触发保存");
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "/") {
      event.preventDefault();
      this.toggleFallbackComment();
    }
  }

  insertText(text) {
    if (this.editor) {
      const selection = this.editor.getSelection();
      this.editor.executeEdits("insert-text", [{ range: selection, text, forceMoveMarkers: true }]);
      this.editor.focus();
      return;
    }
    const ta = this.fallback.textarea;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
    ta.selectionStart = ta.selectionEnd = start + text.length;
    ta.dispatchEvent(new Event("input"));
    ta.focus();
  }

  insertSnippet(label) {
    const item = snippets().find(s => s.label === label);
    if (item) this.insertText(item.code);
  }

  toggleFallbackComment() {
    const ta = this.fallback.textarea;
    const value = ta.value;
    let start = ta.selectionStart;
    let end = ta.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const mark = this.language === "python" ? "#" : "//";
    const uncomment = lines.every(l => l.trim() === "" || l.trim().startsWith(mark));
    const next = lines.map(l => {
      if (!l.trim()) return l;
      return uncomment ? l.replace(new RegExp(`^(\\s*)${mark.replace("/", "\\/")}\\s?`), "$1") : l.replace(/^(\s*)/, `$1${mark} `);
    }).join("\n");
    ta.value = value.slice(0, lineStart) + next + value.slice(lineEnd);
    ta.selectionStart = lineStart;
    ta.selectionEnd = lineStart + next.length;
    ta.dispatchEvent(new Event("input"));
  }

  getValue() {
    if (this.editor) return this.editor.getValue();
    if (this.fallback) return this.fallback.textarea.value;
    return this.value;
  }

  setValue(value) {
    this.value = value || "";
    if (this.editor && this.editor.getValue() !== this.value) this.editor.setValue(this.value);
    if (this.fallback) {
      this.fallback.textarea.value = this.value;
      this.updateFallback();
    }
  }

  setLanguage(language) {
    this.language = language || "cpp";
    if (this.editor && this.monaco) {
      const model = this.editor.getModel();
      this.monaco.editor.setModelLanguage(model, langMap[this.language] || "plaintext");
    }
    this.updateFallback();
  }

  toggleWrap() {
    if (this.editor) {
      const current = this.editor.getOption(this.monaco.editor.EditorOption.wordWrap);
      this.editor.updateOptions({ wordWrap: current === "on" ? "off" : "on" });
      return;
    }
    const ta = this.fallback?.textarea;
    if (ta) ta.style.whiteSpace = ta.style.whiteSpace === "pre-wrap" ? "pre" : "pre-wrap";
  }

  changeFont(delta) {
    if (this.editor) {
      const size = this.editor.getOption(this.monaco.editor.EditorOption.fontSize);
      this.editor.updateOptions({ fontSize: Math.max(12, Math.min(24, size + delta)) });
      return;
    }
    const nodes = $$(".highlight,.code-input,.gutter", this.root);
    nodes.forEach(node => {
      const current = parseInt(getComputedStyle(node).fontSize, 10) || 14;
      node.style.fontSize = `${Math.max(12, Math.min(24, current + delta))}px`;
    });
  }

  focus() {
    if (this.editor) this.editor.focus();
    else this.fallback?.textarea.focus();
  }
}
