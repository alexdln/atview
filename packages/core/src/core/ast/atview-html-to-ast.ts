import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "./types";
import { cleanText, cloneNodesIntoWrapper, splitParagraphs } from "./document-text";

const BLOCK_TAGS = new Set([
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code-block",
    "ul",
    "ol",
    "bsky-post",
    "website",
    "media",
    "math",
]);

const INLINE_TAG_MAP: Record<string, AstInlineNode["type"]> = {
    b: "bold",
    i: "italic",
    u: "underline",
    code: "inline-code",
    s: "strikethrough",
    mark: "highlight",
};

const HEADING_TAG_TO_LEVEL: Record<string, 2 | 3 | 4 | 5 | 6> = {
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
};

const parseRecord = (raw: string, objectStore: Map<string, File>) => {
    if (!raw) return undefined;
    try {
        const parsed = JSON.parse(raw);
        if (parsed.image && typeof parsed.image === "string") {
            const file = objectStore.get(parsed.image);
            if (file) parsed.file = file;
        }
        return parsed;
    } catch {
        return raw;
    }
};

const collectInline = (node: Node, objectStore: Map<string, File>): AstInlineNode[] => {
    if (node.nodeType === Node.TEXT_NODE) {
        const value = cleanText(node.textContent || "");
        return value ? [{ type: "text", value }] : [];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const el = node as HTMLElement;
    const tag = el.dataset.tag;
    const children = collectChildrenInline(el, objectStore);

    if (tag && tag in INLINE_TAG_MAP) {
        if (children.length === 0) return [];
        return [{ type: INLINE_TAG_MAP[tag], children } as AstInlineNode];
    }

    if (tag === "mention") {
        const record = parseRecord(el.dataset.record || "", objectStore);
        if (children.length === 0) return [];

        return [{ type: "mention", did: String(record?.did || ""), children }];
    }

    if (tag === "link") {
        const record = parseRecord(el.dataset.record || "", objectStore);
        if (children.length === 0) return [];

        return [{ type: "link", uri: String(record?.uri || ""), children }];
    }

    return children;
};

const collectChildrenInline = (el: Node, objectStore: Map<string, File>): AstInlineNode[] =>
    Array.from(el.childNodes).flatMap((child) => collectInline(child, objectStore));

/** Block-level spans (heading, blockquote, etc.) store plain text only; ignore nested pseudo-inline markup. */
const plainInlineNodesFromBlockElement = (el: HTMLElement): AstInlineNode[] => {
    const value = cleanText(el.textContent || "");
    return value ? [{ type: "text", value }] : [];
};

const parseListItems = (text: string, marker: RegExp): AstListItem[] =>
    text
        .split("\n")
        .map((line) => line.trim().replace(marker, ""))
        .filter(Boolean)
        .map((item) => ({ children: [{ type: "text" as const, value: item }] }));

export const atviewHtmlToAst = (atviewHtml: HTMLElement, objectStore: Map<string, File>): AstDocument => {
    const blocks: AstBlockNode[] = [];
    let pendingNodes: Node[] = [];

    const flushText = () => {
        if (pendingNodes.length === 0) return;

        const container = cloneNodesIntoWrapper(document, pendingNodes);
        pendingNodes = [];

        const inlines = collectChildrenInline(container, objectStore);
        blocks.push(...splitParagraphs(inlines));
    };

    for (const child of Array.from(atviewHtml.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
            if (child.textContent) pendingNodes.push(child);
            continue;
        }

        if (child.nodeType !== Node.ELEMENT_NODE) continue;

        const el = child as HTMLElement;
        const tag = el.dataset.tag;

        if (!tag || !BLOCK_TAGS.has(tag)) {
            pendingNodes.push(child);
            continue;
        }

        flushText();

        const record = parseRecord(el.dataset.record || "", objectStore);

        if (tag in HEADING_TAG_TO_LEVEL) {
            blocks.push({
                type: "heading",
                level: HEADING_TAG_TO_LEVEL[tag],
                children: plainInlineNodesFromBlockElement(el),
            });
        } else if (tag === "blockquote") {
            blocks.push({
                type: "blockquote",
                children: plainInlineNodesFromBlockElement(el),
            });
        } else if (tag === "code-block") {
            blocks.push({
                type: "code-block",
                text: cleanText(el.textContent || ""),
                ...(record?.language ? { language: String(record.language) } : {}),
            });
        } else if (tag === "ul") {
            blocks.push({
                type: "unordered-list",
                items: parseListItems(cleanText(el.textContent || ""), /^- /),
            });
        } else if (tag === "ol") {
            blocks.push({
                type: "ordered-list",
                items: parseListItems(cleanText(el.textContent || ""), /^[0-9]+\. /),
            });
        } else if (tag === "bsky-post") {
            blocks.push({ type: "bsky-post", uri: String(record?.uri || ""), cid: String(record?.cid || "") });
        } else if (tag === "website") {
            blocks.push({ type: "website", uri: String(record?.uri || ""), title: String(record?.title || "") });
        } else if (tag === "media") {
            blocks.push({
                text: cleanText(el.textContent || ""),
                caption: record?.caption ? String(record.caption) : undefined,
                type: "media",
                image: record?.image || "",
                alt: record?.alt ? String(record.alt) : undefined,
                title: record?.title ? String(record.title) : undefined,
                width: record?.width ? Number(record.width) : undefined,
                height: record?.height ? Number(record.height) : undefined,
            });
        } else if (tag === "math") {
            blocks.push({
                type: "math",
                content: cleanText(el.textContent || ""),
            });
        }
    }

    flushText();
    return blocks;
};
