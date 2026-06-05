import { uid, now, stripHighlightMarkup } from "./utils.js";

export function defaultHtmlDemo() {
  return String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",Arial,sans-serif;color:#111827}
.box{width:min(900px,94vw);background:#fff;border:1px solid #e5e7eb;border-radius:24px;padding:28px;box-shadow:0 20px 50px rgba(15,23,42,.08)}
h1{margin:0 0 12px;font-size:24px}
p{line-height:1.8;color:#64748b}
.flow{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}
.node{padding:16px 20px;border-radius:16px;background:#eff6ff;border:1px solid #bfdbfe;font-weight:800;animation:pop 1.8s infinite alternate}
.node:nth-child(2){animation-delay:.2s}.node:nth-child(3){animation-delay:.4s}.node:nth-child(4){animation-delay:.6s}
@keyframes pop{from{transform:translateY(0);box-shadow:none}to{transform:translateY(-8px);box-shadow:0 16px 30px rgba(37,99,235,.14)}}
</style>
</head>
<body>
  <div class="box">
    <h1>算法运行过程动画</h1>
    <p>在这里用 HTML/CSS/JS 画出当前方法的运行过程，例如指针移动、数组交换、递归栈、队列变化、进程调度等。</p>
    <div class="flow">
      <div class="node">输入</div>
      <div class="node">处理</div>
      <div class="node">状态变化</div>
      <div class="node">输出</div>
    </div>
  </div>
</body>
</html>`;
}

export function createMethod(name = "方法一：考场写法") {
  return {
    id: uid(),
    name,
    language: "cpp",
    code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // 在这里编写 408 代码题答案
    return 0;
}
`,
    note: "",
    htmlDemo: defaultHtmlDemo(),
    createdAt: now()
  };
}

export function createProblem() {
  const method = createMethod();
  return {
    id: uid(),
    title: "未命名代码题",
    type: "数据结构",
    difficulty: "中等",
    tags: ["408"],
    questionText: "",
    images: [],
    methods: [method],
    activeMethodId: method.id,
    createdAt: now(),
    updatedAt: now()
  };
}

export function normalizeProblem(problem) {
  const p = problem || createProblem();
  if (!p.id) p.id = uid();
  if (!p.createdAt) p.createdAt = now();
  if (!p.updatedAt) p.updatedAt = now();
  if (!Array.isArray(p.tags)) p.tags = [];
  if (!Array.isArray(p.images)) p.images = [];
  if (!Array.isArray(p.methods) || p.methods.length === 0) {
    const method = createMethod();
    p.methods = [method];
    p.activeMethodId = method.id;
  }
  if (!p.activeMethodId || !p.methods.find(m => m.id === p.activeMethodId)) {
    p.activeMethodId = p.methods[0].id;
  }
  for (const m of p.methods) {
    if (!m.id) m.id = uid();
    if (!m.name) m.name = "未命名方法";
    if (!m.language) m.language = "cpp";
    if (typeof m.code !== "string") m.code = "";
    if (typeof m.note !== "string") m.note = "";
    if (typeof m.htmlDemo !== "string") m.htmlDemo = "";
    m.code = stripHighlightMarkup(m.code);
  }
  return p;
}

export function getActiveMethod(problem) {
  if (!problem) return null;
  normalizeProblem(problem);
  return problem.methods.find(m => m.id === problem.activeMethodId) || problem.methods[0];
}
