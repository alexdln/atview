export const detectLanguage = (code: string): string => {
    const t = code.trim();
    if (!t) return "";

    if (/^\s*<!DOCTYPE\s/i.test(t) || /^\s*<html[\s>]/i.test(t)) return "html";
    if (/^\s*<\?xml\s/.test(t)) return "xml";
    if (/^\s*<\?php\b/.test(t)) return "php";
    if (/^#!.*\b(bash|sh|zsh)\b/.test(t)) return "shellscript";
    if (/^#!.*\bpython/.test(t)) return "python";
    if (/^#!.*\bnode\b/.test(t)) return "javascript";

    if (/^\s*[{[]/.test(t) && /[\]}]\s*$/.test(t)) {
        try {
            JSON.parse(t);
            return "json";
        } catch {
            /* empty */
        }
    }

    if (/(\b|^)(const|let|var|function)\b/.test(t) && !/(\b|^)(interface|type)\s+\w+/.test(t)) return "javascript";
    if (/(\b|^)(const|let|import|export)\b/.test(t)) return "typescript";
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(t)) return "sql";
    if (/^\s*#include\s*[<"]/.test(t)) return /\bstd::|cout\b|cin\b|class\s+\w+/.test(t) ? "cpp" : "c";
    if (/^\s*package\s+\w+/.test(t) && /\bfunc\s+\w+/.test(t)) return "go";
    if (/(\b|^)fn\s+\w+\s*\(/.test(t) && /\blet\s+(mut\s+)?\w+/.test(t)) return "rust";
    if (/(\b|^)public\s+(static\s+)?class\s+\w+/.test(t)) return "java";
    if (/(\b|^)def\s+\w+\s*\(/.test(t) && /:\s*$/m.test(t)) return "python";
    if (/^\s*(@media|@import|@keyframes)\b/.test(t)) return "css";
    if (/^\s*[\w.#][\w-]*\s*\{[\s\S]*:\s*[^;]+;/m.test(t)) return "css";
    if (/^\s*<\w+[\s>]/.test(t) && /<\/\w+>\s*$/.test(t)) return "html";

    return "";
};

export const LANGUAGE_CLASS_REGEX = /language-([a-z0-9-]+)/i;
