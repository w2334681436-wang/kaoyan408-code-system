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

  const decode = value => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = String(value ?? "");
    return textarea.value;
  };

  for (let round = 0; round < 6; round++) {
    const before = s;

    s = s.replace(/&lt;\s*span\b[^&]*class\s*=\s*(?:&quot;|&#34;|["'])tok-[\s\S]*?&gt;/gi, "");
    s = s.replace(/&lt;\s*\/\s*span\s*&gt;/gi, "");

    s = s.replace(/<\s*span\b[^>]*class\s*=\s*["']?tok-[^>]*>/gi, "");
    s = s.replace(/<\s*\/\s*span\s*>/gi, "");

    s = s.replace(/&lt;\s*span\b[\s\S]*?&gt;/gi, "");
    s = s.replace(/<\s*span\b[^>]*>/gi, "");
    s = s.replace(/&lt;\s*\/\s*span\s*&gt;/gi, "");
    s = s.replace(/<\s*\/\s*span\s*>/gi, "");

    s = decode(s);

    if (s === before) break;
  }

  s = s.replace(/<\s*span\b[^>]*>/gi, "");
  s = s.replace(/<\s*\/\s*span\s*>/gi, "");
  s = decode(s);

  s = s.replace(/\u00a0/g, " ");
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
