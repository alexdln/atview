import { type AtviewFacet, type AtviewFeature, type AtviewHeadingFeature } from "@src/core/defs/document";
import { charPositionToBytePosition } from "@src/core/utils/byte-helpers";

import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "../../ast/types";

const INLINE_TYPE_TO_FACET = {
    bold: "net.atview.richtext.facet#b" as const,
    italic: "net.atview.richtext.facet#i" as const,
    underline: "net.atview.richtext.facet#u" as const,
    "inline-code": "net.atview.richtext.facet#code" as const,
    strikethrough: "net.atview.richtext.facet#strikethrough" as const,
    highlight: "net.atview.richtext.facet#highlight" as const,
};

const HEADING_FACETS: Record<2 | 3 | 4 | 5 | 6, AtviewHeadingFeature["$type"]> = {
    2: "net.atview.richtext.facet#h2",
    3: "net.atview.richtext.facet#h3",
    4: "net.atview.richtext.facet#h4",
    5: "net.atview.richtext.facet#h5",
    6: "net.atview.richtext.facet#h6",
};

export interface RichText {
    textContent: string;
    facets: AtviewFacet[];
}

const plainInline = (node: AstInlineNode): string => {
    if (node.type === "text") return node.value;
    return node.children.map(plainInline).join("");
};

const collectInline = (node: AstInlineNode, richText: RichText) => {
    if (node.type === "text") {
        richText.textContent += node.value;
        return;
    }

    const startChar = richText.textContent.length;
    for (const child of node.children) collectInline(child, richText);
    const endChar = richText.textContent.length;
    if (endChar <= startChar) return;

    const byteStart = charPositionToBytePosition(richText.textContent, startChar);
    const byteEnd = charPositionToBytePosition(richText.textContent, endChar);

    if (node.type === "link") {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "net.atview.richtext.facet#link", uri: node.uri }],
        });
    } else if (node.type === "mention") {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "net.atview.richtext.facet#mention", did: node.did }],
        });
    } else if (node.type in INLINE_TYPE_TO_FACET) {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: INLINE_TYPE_TO_FACET[node.type] }],
        });
    }
};

const collectInlines = (nodes: AstInlineNode[], richText: RichText) => {
    for (const node of nodes) collectInline(node, richText);
};

const pushBlockFacet = (richText: RichText, startChar: number, features: AtviewFeature[]) => {
    const byteStart = charPositionToBytePosition(richText.textContent, startChar);
    const byteEnd = charPositionToBytePosition(richText.textContent, richText.textContent.length);
    richText.facets.push({ index: { byteStart, byteEnd }, features });
};

const renderListText = (items: AstListItem[], marker: (index: number) => string): string =>
    items.map((item, index) => `${marker(index)}${item.children.map(plainInline).join("")}`).join("\n");

const processBlock = (block: AstBlockNode, richText: RichText, isFirst: boolean) => {
    if (!isFirst && richText.textContent.length > 0) {
        richText.textContent += "\n\n";
    }

    const blockStartChar = richText.textContent.length;

    switch (block.type) {
        case "paragraph":
            collectInlines(block.children, richText);
            return;

        case "heading":
            collectInlines(block.children, richText);
            pushBlockFacet(richText, blockStartChar, [{ $type: HEADING_FACETS[block.level] }]);
            return;

        case "blockquote":
            collectInlines(block.children, richText);
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#blockquote" }]);
            return;

        case "code-block":
            richText.textContent += block.text;
            pushBlockFacet(richText, blockStartChar, [
                {
                    $type: "net.atview.richtext.facet#code-block",
                    ...(block.language ? { language: block.language } : {}),
                },
            ]);
            return;

        case "media":
            richText.textContent += block.text ?? "";
            pushBlockFacet(richText, blockStartChar, [
                {
                    $type: "net.atview.richtext.facet#media",
                    image: block.image,
                    aspectRatio: {
                        width: Number(block.width || 0) || 0,
                        height: Number(block.height || 0) || 0,
                    },
                    ...(block.title ? { title: block.title } : {}),
                    ...(block.alt ? { altText: block.alt } : {}),
                    ...(block.caption ? { caption: block.caption } : {}),
                },
            ]);
            return;

        case "unordered-list":
            richText.textContent += renderListText(block.items, () => "- ");
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#ul" }]);
            return;

        case "ordered-list": {
            const start = block.start ?? 1;
            richText.textContent += renderListText(block.items, (i) => `${String(start + i)}. `);
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#ol" }]);
            return;
        }

        case "task-list":
            richText.textContent += block.items
                .map((item) => `${item.checked ? "- [x] " : "- [ ] "}${item.children.map(plainInline).join("")}`)
                .join("\n");
            return;

        case "bsky-post":
            richText.textContent += block.text ?? "";
            pushBlockFacet(richText, blockStartChar, [
                { $type: "net.atview.richtext.facet#bsky-post", uri: block.uri },
            ]);
            return;

        case "website":
            richText.textContent += block.title || block.uri;
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#website", uri: block.uri }]);
            return;

        case "horizontal-rule":
            richText.textContent += "\n\n";
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#horizontal-rule" }]);
            return;

        case "iframe":
            richText.textContent += block.url;
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#iframe", url: block.url }]);
            return;

        case "math":
            richText.textContent += block.content;
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#math", tex: block.content }]);
            return;

        case "hard-break":
            richText.textContent += "\n";
            pushBlockFacet(richText, blockStartChar, [{ $type: "net.atview.richtext.facet#hard-break" }]);
            return;

        case "table":
            return;
    }
};

export const astToData = (ast: AstDocument): RichText => {
    const richText: RichText = { textContent: "", facets: [] };

    ast.forEach((block, index) => processBlock(block, richText, index === 0));

    richText.facets.sort((a, b) =>
        a.index.byteStart !== b.index.byteStart
            ? a.index.byteStart - b.index.byteStart
            : a.index.byteEnd - b.index.byteEnd,
    );

    return richText;
};
