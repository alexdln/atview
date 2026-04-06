import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "./types";
import { formatMediaUri } from "../utils";

const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const escapeAttr = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const renderInline = (node: AstInlineNode): string => {
    switch (node.type) {
        case "text":
            return escapeHtml(node.value);
        case "bold":
            return `<strong>${node.children.map(renderInline).join("")}</strong>`;
        case "italic":
            return `<em>${node.children.map(renderInline).join("")}</em>`;
        case "underline":
            return `<u>${node.children.map(renderInline).join("")}</u>`;
        case "strikethrough":
            return `<s>${node.children.map(renderInline).join("")}</s>`;
        case "highlight":
            return `<mark>${node.children.map(renderInline).join("")}</mark>`;
        case "inline-code":
            return `<code>${node.children.map(renderInline).join("")}</code>`;
        case "link":
            return `<a href="${escapeAttr(node.uri)}">${node.children.map(renderInline).join("")}</a>`;
        case "mention":
            return `<span data-did="${escapeAttr(node.did)}">${node.children.map(renderInline).join("")}</span>`;
        default:
            return "";
    }
};

const renderInlineChildren = (children: AstInlineNode[]): string => children.map(renderInline).join("");

const plainInline = (node: AstInlineNode): string => {
    switch (node.type) {
        case "text":
            return node.value;
        default:
            return node.children.map(plainInline).join("");
    }
};

const plainListItem = (item: AstListItem, context: { authorDid?: string }): string => {
    let t = item.children.map(plainInline).join("");
    if (item.sublist) {
        t += `\n${plainBlock(item.sublist, context)}`;
    }
    return t;
};

const plainBlock = (block: AstBlockNode, context: { authorDid?: string }): string => {
    switch (block.type) {
        case "paragraph":
            return block.children.map(plainInline).join("");
        case "heading":
            return block.children.map(plainInline).join("");
        case "blockquote":
            return block.children.map(plainInline).join("");
        case "code-block":
            return block.text;
        case "media":
            const image = block.image;
            return block.text || formatMediaUri(image, { authorDid: context.authorDid, thumbnail: true });
        case "unordered-list":
            return block.items.map((i) => `- ${plainListItem(i, context)}`).join("\n");
        case "ordered-list": {
            const start = block.start ?? 1;
            return block.items.map((i, j) => `${String(start + j)}. ${plainListItem(i, context)}`).join("\n");
        }
        case "bsky-post":
            return block.text || "";
        case "horizontal-rule":
            return "---";
        case "website":
            return block.title || block.uri;
        case "table":
        case "iframe":
            return "";
        default:
            return "";
    }
};

export const astToPlainText = (ast: AstDocument, context: { authorDid?: string }): string =>
    ast
        .map((block) => plainBlock(block, context))
        .filter(Boolean)
        .join("\n\n");

const renderListItem = (item: AstListItem): string => {
    const inline = escapeHtml(item.children.map(plainInline).join(""));
    if (!item.sublist) return `<li>${inline}</li>`;
    const nested =
        item.sublist.type === "unordered-list" ? renderUnorderedList(item.sublist) : renderOrderedList(item.sublist);
    return `<li>${inline}${nested}</li>`;
};

const renderUnorderedList = (block: Extract<AstBlockNode, { type: "unordered-list" }>): string =>
    `<ul>${block.items.map(renderListItem).join("")}</ul>`;

const renderOrderedList = (block: Extract<AstBlockNode, { type: "ordered-list" }>): string => {
    const start = block.start ?? 1;
    const startAttr = start !== 1 ? ` start="${String(start)}"` : "";
    return `<ol${startAttr}>${block.items.map(renderListItem).join("")}</ol>`;
};

const mediaSrc = (image: AstBlockNode): string =>
    "image" in image && typeof image.image === "string" ? image.image : "";

const renderBlock = (block: AstBlockNode): string => {
    switch (block.type) {
        case "paragraph":
            return `<p>${renderInlineChildren(block.children)}</p>`;

        case "heading": {
            const tag = `h${String(block.level)}`;
            return `<${tag}>${escapeHtml(block.children.map(plainInline).join(""))}</${tag}>`;
        }

        case "blockquote":
            return `<blockquote>${escapeHtml(block.children.map(plainInline).join(""))}</blockquote>`;

        case "code-block": {
            const langId = block.language?.replace(/[^a-z0-9_-]/gi, "") ?? "";
            const langAttr = langId ? ` class="language-${langId}"` : "";
            return `<pre><code${langAttr}>${escapeHtml(block.text)}</code></pre>`;
        }

        case "media": {
            const src = escapeAttr(mediaSrc(block));
            const alt = escapeAttr(block.alt || "");
            const w = block.width ? ` width="${escapeAttr(block.width)}"` : "";
            const h = block.height ? ` height="${escapeAttr(block.height)}"` : "";
            const img = `<img src="${src}" alt="${alt}"${w}${h} />`;
            const cap = block.text ? `<figcaption>${escapeHtml(block.text)}</figcaption>` : "";
            return `<figure>${img}${cap}</figure>`;
        }

        case "unordered-list":
            return renderUnorderedList(block);

        case "ordered-list":
            return renderOrderedList(block);

        case "bsky-post": {
            const text = block.text ? escapeHtml(block.text) : "";
            return `<p data-tag="bsky-post" data-uri="${escapeAttr(block.uri)}" data-cid="${escapeAttr(block.cid)}"><a href="${escapeAttr(block.uri)}">${text}</a></p>`;
        }

        case "horizontal-rule":
            return "<hr />";

        case "website": {
            const label = escapeHtml(block.title || block.uri);
            return `<p><a href="${escapeAttr(block.uri)}">${label}</a></p>`;
        }

        case "table":
        case "iframe":
            return "";

        default:
            return "";
    }
};

export const astToRealHtml = (ast: AstDocument): string => ast.map(renderBlock).join("");
