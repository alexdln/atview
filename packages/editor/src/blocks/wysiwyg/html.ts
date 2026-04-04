import { createPseudoFacet } from "./facets";
import { FORMATTING_BY_TAG, FORMATTING_HTML_TO_TAG } from "./plugins";
import { isListTag, listElementToText, textToListElement } from "./lists";

interface Options {
    origin?: string;
}

const mediaPreviewStyles = (uri: string, width: number, height: number): Record<string, string> | undefined => {
    if (!uri || !width || !height) return undefined;
    return {
        "--preview-url": `url(${uri})`,
        "--aspect-ratio": `${Math.round((width / height) * 100) / 100}`,
    };
};

const parseSource = (source?: string | null) => {
    if (!source) return undefined;
    const options = source.split(",");
    const lastOption = options?.[options.length - 1].trim();
    const uri = lastOption?.split(" ")[0].trim();
    return uri;
};

const parseRecord = (value?: string): Record<string, unknown> | undefined => {
    if (!value) return undefined;
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};

const convertPseudoToReal = (source: Node, doc: Document): Node | null => {
    if (source.nodeType === Node.TEXT_NODE) {
        return doc.createTextNode(source.textContent || "");
    }
    if (source.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    const element = source as HTMLElement;
    const tag = element.dataset.tag;

    if (!tag) {
        const wrapper = doc.createElement("span");
        for (const child of Array.from(element.childNodes)) {
            const converted = convertPseudoToReal(child, doc);
            if (converted) wrapper.appendChild(converted);
        }
        return wrapper;
    }

    const text = element.textContent || "";
    const record = parseRecord(element.dataset.record);
    const formatting = FORMATTING_BY_TAG[tag];

    if (formatting) {
        if (isListTag(formatting.tag)) {
            return textToListElement(doc, text, formatting.tag);
        }
        const target = doc.createElement(formatting.htmlTag);
        target.textContent = text;
        return target;
    }

    if (tag === "link") {
        const anchor = doc.createElement("a");
        anchor.href = String(record?.uri || "");
        anchor.textContent = text;
        return anchor;
    }

    if (tag === "bsky-post") {
        const post = doc.createElement("bsky-post");
        post.setAttribute("data-uri", String(record?.uri || ""));
        post.setAttribute("data-cid", String(record?.cid || ""));
        post.textContent = text;
        return post;
    }

    if (tag === "media") {
        const figure = doc.createElement("figure");
        figure.setAttribute("data-atview-media", "1");
        figure.setAttribute("data-image", String(record?.image || ""));
        figure.setAttribute("data-alt", String(record?.alt || ""));
        figure.setAttribute("data-caption", String(record?.caption || ""));
        figure.setAttribute("data-width", String(record?.width || ""));
        figure.setAttribute("data-height", String(record?.height || ""));

        const image = doc.createElement("img");
        image.src = String(record?.image || "");
        image.alt = String(record?.alt || "");
        figure.appendChild(image);
        if (record?.caption) {
            const figcaption = doc.createElement("figcaption");
            figcaption.textContent = String(record.caption);
            figure.appendChild(figcaption);
        }
        return figure;
    }

    if (tag === "code-block") {
        const pre = doc.createElement("pre");
        if (record?.filename) pre.setAttribute("data-filename", String(record.filename));
        if (record?.language) pre.setAttribute("data-language", String(record.language));
        const code = doc.createElement("code");
        code.textContent = text;
        pre.appendChild(code);
        return pre;
    }

    return doc.createTextNode(text);
};

const textContentWithBr = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if ((node as HTMLElement).tagName.toLowerCase() === "br") return "\n";
    return Array.from(node.childNodes).map(textContentWithBr).join("");
};

const detectLanguage = (code: string): string => {
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
        } catch {}
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

const BLOCK_CONTAINERS = new Set(["p", "div", "section", "article", "header", "footer", "main", "aside", "nav"]);

const convertRealToPseudo = (source: Node, doc: Document, options: Options = {}): Node[] => {
    const { origin } = options;
    if (source.nodeType === Node.TEXT_NODE) {
        return [doc.createTextNode(source.textContent || "")];
    }
    if (source.nodeType !== Node.ELEMENT_NODE) {
        return [];
    }

    const element = source as HTMLElement;
    const htmlTag = element.tagName.toLowerCase();

    if (htmlTag === "br") {
        return [doc.createTextNode("\n")];
    }

    if (htmlTag === "ul" || htmlTag === "ol") {
        return [
            createPseudoFacet(doc, {
                tag: htmlTag,
                type: "block",
                text: listElementToText(element, htmlTag),
            }),
        ];
    }

    const normalizedTag = FORMATTING_HTML_TO_TAG[htmlTag];
    if (normalizedTag) {
        const formatting = FORMATTING_BY_TAG[normalizedTag];
        if (!formatting) return [];
        if (formatting.block) {
            return [
                createPseudoFacet(doc, {
                    tag: formatting.tag,
                    type: "block",
                    text: element.textContent || "",
                }),
            ];
        }
        return Array.from(element.childNodes).flatMap((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                return [
                    createPseudoFacet(doc, {
                        tag: formatting.tag,
                        type: "inline",
                        text: child.textContent || "",
                    }),
                ];
            }
            return convertRealToPseudo(child, doc, { origin });
        });
    }

    if (htmlTag === "li") {
        return [doc.createTextNode(element.textContent || "")];
    }

    if (htmlTag === "a") {
        return [
            createPseudoFacet(doc, {
                tag: "link",
                type: "inline",
                text: element.textContent || "",
                record: { uri: element.getAttribute("href") || "" },
            }),
        ];
    }

    if (htmlTag === "bsky-post") {
        return [
            createPseudoFacet(doc, {
                tag: "bsky-post",
                type: "block",
                text: element.textContent || "",
                record: { uri: element.getAttribute("data-uri") || "", cid: element.getAttribute("data-cid") || "" },
            }),
        ];
    }

    if (htmlTag === "figure") {
        const image = element.querySelector("img");
        if (image) {
            const uri =
                element.getAttribute("data-uri") ||
                element.getAttribute("data-image") ||
                image.src ||
                parseSource(element.querySelector("source")?.getAttribute("srcset")) ||
                "";

            const width = Number(element.getAttribute("data-width") || image.getAttribute("width") || 0);
            const height = Number(element.getAttribute("data-height") || image.getAttribute("height") || 0);
            const caption =
                element.querySelector("figcaption")?.textContent || element.getAttribute("data-caption") || "";
            return [
                createPseudoFacet(doc, {
                    tag: "media",
                    type: "block",
                    text: image.alt || caption || "[Image]",
                    record: {
                        image: uri,
                        alt: element.getAttribute("data-alt") || image.alt || "",
                        caption,
                        width,
                        height,
                    },
                    styles: mediaPreviewStyles(uri, width, height),
                }),
            ];
        }
    }

    if (htmlTag === "img") {
        const image = element as HTMLImageElement;
        const uri = image.src || "";
        const width = Number(image.getAttribute("width") || 0);
        const height = Number(image.getAttribute("height") || 0);
        return [
            createPseudoFacet(doc, {
                tag: "media",
                type: "block",
                text: image.alt || uri || "",
                record: { image: uri, alt: image.alt || "", caption: "", width, height },
                styles: mediaPreviewStyles(uri, width, height),
            }),
        ];
    }

    if (htmlTag === "pre") {
        const code = element.querySelector("code");
        const text = textContentWithBr(code || element);
        const languageClass = code?.className.match(/language-([a-z0-9-]+)/i)?.[1];
        const language = element.getAttribute("data-language") || languageClass || detectLanguage(text);
        return [
            createPseudoFacet(doc, {
                tag: "code-block",
                type: "block",
                text,
                record: {
                    filename: element.getAttribute("data-filename") || "",
                    language,
                },
            }),
        ];
    }

    const childNodes = Array.from(element.childNodes);
    const children: Node[] = [];
    for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        const isParagraph = child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName === "P";
        if (
            isParagraph &&
            childNodes[i - 1]?.nodeType === Node.ELEMENT_NODE &&
            (childNodes[i - 1] as HTMLElement).tagName === "P"
        ) {
            children.push(doc.createTextNode("\n"));
        }
        children.push(...convertRealToPseudo(child, doc, { origin }));
    }
    if (BLOCK_CONTAINERS.has(htmlTag) && children.length > 0) {
        children.push(doc.createTextNode("\n"));
    }
    return children;
};

export const isSelectionInsideEditor = (editor: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const startEl =
        range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as HTMLElement)
            : range.startContainer.parentElement;
    const endEl =
        range.endContainer.nodeType === Node.ELEMENT_NODE
            ? (range.endContainer as HTMLElement)
            : range.endContainer.parentElement;

    return Boolean(startEl && endEl && editor.contains(startEl) && editor.contains(endEl));
};

export const buildHtmlFromSelection = (editor: HTMLDivElement) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !isSelectionInsideEditor(editor)) return null;

    const range = selection.getRangeAt(0);
    const sourceFragment = range.cloneContents();
    const targetDoc = document.implementation.createHTMLDocument("");
    const container = targetDoc.createElement("div");

    for (const child of Array.from(sourceFragment.childNodes)) {
        const converted = convertPseudoToReal(child, targetDoc);
        if (converted) container.appendChild(converted);
    }

    return {
        html: container.innerHTML,
        text: container.textContent || "",
    };
};

export const buildPseudoFragmentFromHtml = (html: string, targetDoc: Document, options: Options = {}) => {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const fragment = targetDoc.createDocumentFragment();

    for (const child of Array.from(parsed.body.childNodes)) {
        for (const node of convertRealToPseudo(child, targetDoc, options)) {
            fragment.appendChild(node);
        }
    }

    return fragment;
};

export const extractArticleHtml = (pageHtml: string): string => {
    const doc = new DOMParser().parseFromString(pageHtml, "text/html");

    doc.querySelectorAll("h1, .speechify-ignore, script, style, header, footer").forEach((el) => el.remove());
    const article = doc.querySelector("article");
    if (article) {
        return article.innerHTML;
    }

    return doc.body.innerHTML;
};

export const insertHtmlToEditor = (
    html: string,
    editor: HTMLDivElement,
    normalizeEditor: () => void,
    options: Options = {},
) => {
    const fragment = buildPseudoFragmentFromHtml(html, document, options);
    const nodes = Array.from(fragment.childNodes);
    if (!nodes.length) return;

    editor.textContent = "";
    editor.appendChild(fragment);
    normalizeEditor();
};

export const processImportImages = async (
    articleHtml: string,
    objectStore: Map<string, File>,
    options: Options = {},
): Promise<string> => {
    const { origin } = options;
    const doc = new DOMParser().parseFromString(articleHtml, "text/html");
    const images = doc.querySelectorAll("img");

    await Promise.all(
        Array.from(images).map(async (img) => {
            const container = img.closest("figure, picture");

            const src =
                img.getAttribute("src") || parseSource(container?.querySelector("source")?.getAttribute("srcset"));
            if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;

            let fetchUrl = src;
            if (src.startsWith("//")) fetchUrl = `https:${src}`;
            if (!fetchUrl.startsWith("http://") && !fetchUrl.startsWith("https://") && !origin) return;
            if (!fetchUrl.startsWith("http://") && !fetchUrl.startsWith("https://")) fetchUrl = `${origin}${src}`;

            try {
                const response = await fetch(fetchUrl);
                if (!response.ok) return;

                const blob = await response.blob();
                const filename = new URL(fetchUrl).pathname.split("/").pop() || "image";
                const file = new File([blob], filename, { type: blob.type });
                const previewUrl = URL.createObjectURL(file);

                const loaded = new Image();
                loaded.src = previewUrl;
                await new Promise<void>((resolve) => {
                    loaded.onload = () => resolve();
                    loaded.onerror = () => resolve();
                });

                objectStore.set(previewUrl, file);
                img.src = previewUrl;
                if (loaded.naturalWidth && loaded.naturalHeight) {
                    img.setAttribute("width", String(loaded.naturalWidth));
                    img.setAttribute("height", String(loaded.naturalHeight));
                }
            } catch {
                // Keep original URL if fetch fails
            }
        }),
    );

    return doc.body.innerHTML;
};
