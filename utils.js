export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
export const now = () => new Date().toISOString();

export function uid() {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

export function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(text ?? "");
  return textarea.value;
}

export function stripHighlightMarkup(code) {
  let s = String(code ?? "");
  if (!s) return "";

  // 修复旧版本把 <span class="tok-xxx"> 当成代码保存进去的问题。
  // 兼容两类污染：
  // 1. <span class="tok-type">int</span>
  // 2. &lt;span class="tok-type"&gt;int&lt;/span&gt;
  if (s.includes("&lt;span") || s.includes("&amp;lt;span") || s.includes("<span class=\"tok-")) {
    for (let i = 0; i < 3; i++) s = decodeHtmlEntities(s);
    s = s.replace(/<span\s+class=["']tok-[^"']+["']\s*>/g, "");
    s = s.replace(/<\/span>/g, "");
    s = s.replace(/<span[^>]*>/g, "");
    s = s.replace(/<\/span>/g, "");
    s = decodeHtmlEntities(s);
  }

  // 清理旧高亮可能产生的 HTML 残留，但不碰正常 C/C++ 小于号。
  s = s.replace(/\r\n/g, "\n");
  return s;
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("zh-CN", { hour12: false });
}

export function debounce(fn, delay = 500) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 1800);
}

export function downloadText(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function safeJsonParse(text) {
  try {
    return [JSON.parse(text), null];
  } catch (error) {
    return [null, error];
  }
}

export function copyText(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
  return Promise.resolve();
}

export function showImage(src) {
  $("#imageModalImg").src = src;
  $("#imageModal").classList.add("open");
}

export function closeImage() {
  $("#imageModal").classList.remove("open");
  $("#imageModalImg").src = "";
}

export function requestFullScreen(el) {
  if (document.fullscreenElement) document.exitFullscreen();
  else el?.requestFullscreen?.();
}
