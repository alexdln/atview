import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "./types";

const ZERO_WIDTH_SPACES = /\u200B/g;

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
    "media",
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

const cleanText = (text: string) => text.replace(ZERO_WIDTH_SPACES, "").replace(/\r/g, "");

const collectInline = (node: Node, objectStore: Map<string, File>): AstInlineNode[] => {
    if (node.nodeType === Node.TEXT_NODE) {
        const value = cleanText(node.textContent || "");
        return value ? [{ type: "text", value }] : [];
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const el = node as HTMLElement;
    const tag = el.dataset.tag;

    if (tag && tag in INLINE_TAG_MAP) {
        const children = collectChildrenInline(el, objectStore);
        if (children.length === 0) return [];
        return [{ type: INLINE_TAG_MAP[tag], children } as AstInlineNode];
    }

    if (tag === "link") {
        const record = parseRecord(el.dataset.record || "", objectStore);
        const children = collectChildrenInline(el, objectStore);
        if (children.length === 0) return [];

        if (record?.did) {
            return [{ type: "mention", did: String(record.did), children }];
        }
        return [{ type: "link", uri: String(record?.uri || ""), children }];
    }

    return collectChildrenInline(el, objectStore);
};

const collectChildrenInline = (el: Node, objectStore: Map<string, File>): AstInlineNode[] =>
    Array.from(el.childNodes).flatMap((child) => collectInline(child, objectStore));

const extractInlineContent = (el: Node, objectStore: Map<string, File>): AstInlineNode[] => {
    const nodes = collectChildrenInline(el, objectStore);
    return nodes.length > 0 ? nodes : [{ type: "text", value: "" }];
};

const splitParagraphs = (nodes: AstInlineNode[]): AstBlockNode[] => {
    const blocks: AstBlockNode[] = [];
    let queueNodes: AstInlineNode[] = [];
    nodes.forEach((node) => {
        if (node.type === "text" && node.value.includes("\n\n")) {
            const textParagraphs = node.value.split("\n\n");
            textParagraphs.slice(0, -1).forEach((text) => {
                if (!text.trim()) return;
                blocks.push({ type: "paragraph", children: [...queueNodes, { type: "text", value: text }] });
                queueNodes = [];
            });
            queueNodes = [...queueNodes, { type: "text", value: textParagraphs[textParagraphs.length - 1] }];
        } else {
            queueNodes.push(node);
        }
    });

    if (queueNodes.length > 0) {
        blocks.push({ type: "paragraph", children: queueNodes });
    }
    return blocks;
};

const parseListItems = (text: string, marker: RegExp): AstListItem[] =>
    text
        .split("\n")
        .map((line) => line.trim().replace(marker, ""))
        .filter(Boolean)
        .map((item) => ({ children: [{ type: "text" as const, value: item }] }));

export const htmlToAst = (html: HTMLElement, objectStore: Map<string, File>): AstDocument => {
    const blocks: AstBlockNode[] = [];
    let pendingNodes: Node[] = [];

    const flushText = () => {
        if (pendingNodes.length === 0) return;

        const container = document.createElement("div");
        for (const node of pendingNodes) {
            container.appendChild(node.cloneNode(true));
        }
        pendingNodes = [];

        const inlines = collectChildrenInline(container, objectStore);
        blocks.push(...splitParagraphs(inlines));
    };

    for (const child of Array.from(html.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
            pendingNodes.push(child);
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
                children: extractInlineContent(el, objectStore),
            });
        } else if (tag === "blockquote") {
            blocks.push({
                type: "blockquote",
                children: extractInlineContent(el, objectStore),
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
        } else if (tag === "media") {
            blocks.push({
                type: "media",
                image: record?.image || "",
                alt: record?.alt ? String(record.alt) : undefined,
                width: record?.width ? String(record.width) : undefined,
                height: record?.height ? String(record.height) : undefined,
            });
        }
    }

    flushText();
    return blocks;
};
