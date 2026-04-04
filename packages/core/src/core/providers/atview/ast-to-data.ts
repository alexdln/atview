import { type Facet } from "@src/core/defs/document";
import { charPositionToBytePosition } from "@src/core/utils/byte-helpers";

import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "../../ast/types";

const INLINE_TYPE_TO_FACET: Record<string, string> = {
    bold: "net.atview.richtext.facet#b",
    italic: "net.atview.richtext.facet#i",
    underline: "net.atview.richtext.facet#u",
    "inline-code": "net.atview.richtext.facet#code",
};

interface Collector {
    text: string;
    facets: Facet[];
}

const collectInline = (node: AstInlineNode, collector: Collector) => {
    if (node.type === "text") {
        collector.text += node.value;
        return;
    }

    const startChar = collector.text.length;

    for (const child of node.children) {
        collectInline(child, collector);
    }

    const endChar = collector.text.length;
    if (endChar <= startChar) return;

    const byteStart = charPositionToBytePosition(collector.text, startChar);
    const byteEnd = charPositionToBytePosition(collector.text, endChar);

    if (node.type === "link") {
        collector.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "net.atview.richtext.facet#link", uri: node.uri }],
        });
    } else if (node.type === "mention") {
        collector.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "net.atview.richtext.facet#mention", did: node.did }],
        });
    } else if (node.type in INLINE_TYPE_TO_FACET) {
        collector.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: INLINE_TYPE_TO_FACET[node.type] }],
        });
    }
};

const collectInlines = (nodes: AstInlineNode[], collector: Collector) => {
    for (const node of nodes) collectInline(node, collector);
};

const renderListText = (items: AstListItem[], marker: (index: number) => string): string =>
    items
        .map((item, index) => {
            const text = item.children.map((node) => (node.type === "text" ? node.value : "")).join("");
            return `${marker(index)}${text}`;
        })
        .join("\n");

const processBlock = (block: AstBlockNode, collector: Collector, isFirst: boolean) => {
    if (!isFirst && collector.text.length > 0) {
        collector.text += "\n\n";
    }

    const blockStartChar = collector.text.length;

    switch (block.type) {
        case "paragraph": {
            collectInlines(block.children, collector);
            break;
        }

        case "heading": {
            const facetType = `net.atview.richtext.facet#h${String(block.level)}`;
            collectInlines(block.children, collector);
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({ index: { byteStart, byteEnd }, features: [{ $type: facetType }] });
            break;
        }

        case "blockquote": {
            collectInlines(block.children, collector);
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: "net.atview.richtext.facet#blockquote" }],
            });
            break;
        }

        case "code-block": {
            collector.text += block.text;
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [
                    {
                        $type: "net.atview.richtext.facet#code-block",
                        ...(block.language ? { language: block.language } : {}),
                    },
                ],
            });
            break;
        }

        case "media": {
            collector.text += block.text;
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [
                    {
                        $type: "net.atview.richtext.facet#media",
                        image: block.image,
                        ...(block.alt ? { altText: block.alt } : {}),
                        ...(block.width ? { width: block.width } : {}),
                        ...(block.height ? { height: block.height } : {}),
                    },
                ],
            });
            break;
        }

        case "unordered-list": {
            collector.text += renderListText(block.items, () => "- ");
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: "net.atview.richtext.facet#ul" }],
            });
            break;
        }

        case "ordered-list": {
            const start = block.start ?? 1;
            collector.text += renderListText(block.items, (i) => `${String(start + i)}. `);
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: "net.atview.richtext.facet#ol" }],
            });
            break;
        }

        case "bsky-post": {
            collector.text += block.text;
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: "net.atview.richtext.facet#bsky-post", uri: block.uri }],
            });
            break;
        }

        case "website": {
            collector.text += block.title || block.uri;
            const byteStart = charPositionToBytePosition(collector.text, blockStartChar);
            const byteEnd = charPositionToBytePosition(collector.text, collector.text.length);
            collector.facets.push({
                index: { byteStart, byteEnd },
                features: [{ $type: "net.atview.richtext.facet#website", uri: block.uri }],
            });
            break;
        }

        case "horizontal-rule":
        case "table":
        case "iframe":
            break;
    }
};

export const astToData = (ast: AstDocument): { textContent: string; facets: Facet[] } => {
    const collector: Collector = { text: "", facets: [] };

    ast.forEach((block, index) => processBlock(block, collector, index === 0));

    collector.facets.sort((a, b) =>
        a.index.byteStart !== b.index.byteStart
            ? a.index.byteStart - b.index.byteStart
            : a.index.byteEnd - b.index.byteEnd,
    );

    return { textContent: collector.text, facets: collector.facets };
};
