import { escapeHtml } from "./utils.js";

export function highlightCode(code, lang = "cpp") {
  const placeholders = [];
  const stash = (className, text) => {
    const key = `@@PLACEHOLDER_${placeholders.length}@@`;
    placeholders.push(`<span class="${className}">${escapeHtml(text)}</span>`);
    return key;
  };

  let s = String(code ?? "");
  s = s.replace(/\/\*[\s\S]*?\*\//g, m => stash("tok-comment", m));
  s = s.replace(/\/\/.*$/gm, m => stash("tok-comment", m));
  if (["python", "py"].includes(lang)) s = s.replace(/#.*$/gm, m => stash("tok-comment", m));
  s = s.replace(/(["'`])(?:\\.|(?!\1)[\s\S])*\1/g, m => stash("tok-string", m));
  s = escapeHtml(s);

  const keywords = [
    "if","else","for","while","do","switch","case","break","continue","return",
    "struct","class","public","private","protected","static","const","void",
    "new","delete","try","catch","throw","template","typename","using","namespace",
    "include","define","typedef","sizeof","auto","this","import","from","def",
    "lambda","in","not","and","or","is","None","True","False"
  ];
  const types = [
    "int","long","short","float","double","char","bool","boolean","string","String",
    "vector","queue","stack","deque","map","set","unordered_map","unordered_set",
    "List","ArrayList","HashMap","TreeMap","TreeSet","Node","LNode","BiTree"
  ];

  s = s.replace(new RegExp(`\\b(${keywords.join("|")})\\b`, "g"), `<span class="tok-keyword">$1</span>`);
  s = s.replace(new RegExp(`\\b(${types.join("|")})\\b`, "g"), `<span class="tok-type">$1</span>`);
  s = s.replace(/\b(\d+(?:\.\d+)?)\b/g, `<span class="tok-number">$1</span>`);
  s = s.replace(/(^|\n)(\s*#\s*\w+)/g, `$1<span class="tok-pre">$2</span>`);
  s = s.replace(/\b([A-Za-z_]\w*)(?=\s*\()/g, `<span class="tok-func">$1</span>`);
  s = s.replace(/(&lt;=|&gt;=|==|!=|\+\+|--|-&gt;|&&|\|\||[+\-*\/%=<>!&|])/g, `<span class="tok-op">$1</span>`);

  placeholders.forEach((html, i) => {
    s = s.replaceAll(`@@PLACEHOLDER_${i}@@`, html);
  });
  return s || "";
}

export function plainTextFromCode(code) {
  return String(code ?? "");
}
