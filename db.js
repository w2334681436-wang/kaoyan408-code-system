import { normalizeProblem } from "./models.js";

const DB_NAME = "kaoyan408-code-system-flat-db";
const DB_VERSION = 2;
const STORE = "problems";
const FALLBACK_KEY = "kaoyan408-code-system-flat-fallback";

let db = null;
let useFallback = false;

export async function initDB() {
  if (!("indexedDB" in window)) {
    useFallback = true;
    return;
  }
  try {
    db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = event => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE)) {
          const store = database.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("updatedAt", "updatedAt");
          store.createIndex("createdAt", "createdAt");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.warn("IndexedDB 不可用，已切换 localStorage 兜底", error);
    useFallback = true;
  }
}

function objectStore(mode = "readonly") {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function getFallbackList() {
  try {
    const list = JSON.parse(localStorage.getItem(FALLBACK_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function setFallbackList(list) {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(list));
}

export async function getAllProblems() {
  if (useFallback) return getFallbackList().map(normalizeProblem);
  return await new Promise((resolve, reject) => {
    const req = objectStore().getAll();
    req.onsuccess = () => resolve((req.result || []).map(normalizeProblem));
    req.onerror = () => reject(req.error);
  });
}

export async function getProblem(id) {
  if (useFallback) return getFallbackList().map(normalizeProblem).find(p => p.id === id) || null;
  return await new Promise((resolve, reject) => {
    const req = objectStore().get(id);
    req.onsuccess = () => resolve(req.result ? normalizeProblem(req.result) : null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveProblem(problem) {
  const p = normalizeProblem(problem);
  if (useFallback) {
    const list = getFallbackList();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx >= 0) list[idx] = p;
    else list.unshift(p);
    setFallbackList(list);
    return p;
  }
  return await new Promise((resolve, reject) => {
    const req = objectStore("readwrite").put(p);
    req.onsuccess = () => resolve(p);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProblem(id) {
  if (useFallback) {
    setFallbackList(getFallbackList().filter(p => p.id !== id));
    return;
  }
  return await new Promise((resolve, reject) => {
    const req = objectStore("readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearProblems() {
  if (useFallback) {
    setFallbackList([]);
    return;
  }
  return await new Promise((resolve, reject) => {
    const req = objectStore("readwrite").clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function importProblems(list, replace = false) {
  if (replace) await clearProblems();
  let count = 0;
  for (const raw of list) {
    await saveProblem(normalizeProblem(raw));
    count++;
  }
  return count;
}
