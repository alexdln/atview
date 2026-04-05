import { formatMediaUri } from "@src/core/utils/media";

import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "./types";

const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const escapeAttr = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const INLINE_TAG_MAP: Record<string, string> = {
    bold: "b",
    italic: "i",
    underline: "u",
    "inline-code": "code",
    strikethrough: "s",
    highlight: "mark",
};

const renderInline = (node: AstInlineNode): string => {
    if (node.type === "text") return escapeHtml(node.value);

    if (node.type === "link") {
        const record = JSON.stringify({ uri: node.uri });
        return `<span data-tag="link" data-record='${escapeAttr(record)}'>${node.children.map(renderInline).join("")}</span>`;
    }

    if (node.type === "mention") {
        const record = JSON.stringify({ did: node.did });
        return `<span data-tag="mention" data-record='${escapeAttr(record)}'>${node.children.map(renderInline).join("")}</span>`;
    }

    const tag = INLINE_TAG_MAP[node.type];
    if (tag) {
        return `<span data-tag="${tag}">${node.children.map(renderInline).join("")}</span>`;
    }

    return node.children.map(renderInline).join("");
};

const renderInlineChildren = (children: AstInlineNode[]): string => children.map(renderInline).join("");

const renderListItems = (items: AstListItem[], marker: (i: number) => string): string =>
    items.map((item, i) => `${marker(i)}${renderInlineChildren(item.children)}`).join("\n");

const renderBlock = (block: AstBlockNode, context: { authorDid?: string }): string => {
    switch (block.type) {
        case "paragraph":
            return renderInlineChildren(block.children);

        case "heading": {
            const tag = `h${String(block.level)}`;
            return `<span data-tag="${tag}">${renderInlineChildren(block.children)}</span>`;
        }

        case "blockquote":
            return `<span data-tag="blockquote">${renderInlineChildren(block.children)}</span>`;

        case "code-block": {
            const record = block.language ? JSON.stringify({ language: block.language }) : "";
            const recordAttr = record ? ` data-record='${escapeAttr(record)}'` : "";
            return `<span data-tag="code-block"${recordAttr}>${escapeHtml(block.text)}</span>`;
        }

        case "media": {
            const text = block.text ? escapeHtml(block.text) : "";
            const record = JSON.stringify({
                image: block.image,
                alt: block.alt || "",
                width: block.width || "",
                height: block.height || "",
            });
            const w = Number(block.width) || 0;
            const h = Number(block.height) || 1;
            const ratio = Math.round((w / h) * 100) / 100;

            const previewUrl = formatMediaUri(block.image as string, context.authorDid);
            const previewStyle = `--preview-url: url(${previewUrl});--aspect-ratio: ${String(ratio)}`;

            return `<span data-tag="media" data-record='${escapeAttr(record)}' style='${previewStyle}'>${text}</span>`;
        }

        case "unordered-list": {
            const text = renderListItems(block.items, () => "- ");
            return `<span data-tag="ul">${escapeHtml(text)}</span>`;
        }

        case "ordered-list": {
            const start = block.start ?? 1;
            const text = renderListItems(block.items, (i) => `${String(start + i)}. `);
            return `<span data-tag="ol">${escapeHtml(text)}</span>`;
        }

        case "bsky-post": {
            const record = JSON.stringify({ uri: block.uri, cid: block.cid });
            return `<span data-tag="bsky-post" data-record='${escapeAttr(record)}'>&#8203;</span>`;
        }

        case "horizontal-rule":
            return "<hr />";

        case "website": {
            const record = JSON.stringify({ uri: block.uri });
            const label = block.title || block.uri;
            return `<span data-tag="website" data-record='${escapeAttr(record)}'>${escapeHtml(label)}</span>`;
        }

        case "table":
        case "iframe":
            return "";
    }
};

export interface AstToAtviewHtmlContext {
    authorDid?: string;
}

export const astToAtviewHtml = (ast: AstDocument, context: AstToAtviewHtmlContext = {}): string => {
    const parts: string[] = [];
    let prevType: string | null = null;

    for (const block of ast) {
        if (block.type === "paragraph" && prevType === "paragraph") {
            parts.push("\n\n");
        }
        parts.push(renderBlock(block, context));
        prevType = block.type;
    }

    return parts.join("");
};
