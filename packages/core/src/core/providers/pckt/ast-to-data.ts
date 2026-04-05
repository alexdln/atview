import { type Facet, type PcktBlock, type PcktListItem } from "@src/core/defs/document";
import { charPositionToBytePosition } from "@src/core/utils/byte-helpers";

import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "../../ast/types";

const INLINE_TYPE_TO_FACET: Record<string, string> = {
    bold: "blog.pckt.richtext.facet#bold",
    italic: "blog.pckt.richtext.facet#italic",
    underline: "blog.pckt.richtext.facet#underline",
    "inline-code": "blog.pckt.richtext.facet#code",
    strikethrough: "blog.pckt.richtext.facet#strikethrough",
};

interface RichText {
    plaintext: string;
    facets: Facet[];
}

const collectInline = (node: AstInlineNode, richText: RichText) => {
    if (node.type === "text") {
        richText.plaintext += node.value;
        return;
    }

    const startChar = richText.plaintext.length;
    for (const child of node.children) collectInline(child, richText);
    const endChar = richText.plaintext.length;
    if (endChar <= startChar) return;

    const byteStart = charPositionToBytePosition(richText.plaintext, startChar);
    const byteEnd = charPositionToBytePosition(richText.plaintext, endChar);

    if (node.type === "link") {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "blog.pckt.richtext.facet#link", uri: node.uri }],
        });
    } else if (node.type === "mention") {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "blog.pckt.richtext.facet#didMention", did: node.did }],
        });
    } else if (node.type in INLINE_TYPE_TO_FACET) {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: INLINE_TYPE_TO_FACET[node.type] }],
        });
    }
};

const inlinesToRichText = (nodes: AstInlineNode[]): RichText => {
    const richText: RichText = { plaintext: "", facets: [] };
    for (const node of nodes) collectInline(node, richText);
    richText.facets.sort((a, b) =>
        a.index.byteStart !== b.index.byteStart
            ? a.index.byteStart - b.index.byteStart
            : a.index.byteEnd - b.index.byteEnd,
    );
    return richText;
};

const textBlockFromInlines = (nodes: AstInlineNode[]): PcktBlock => {
    const richText = inlinesToRichText(nodes);
    return {
        $type: "blog.pckt.block.text",
        plaintext: richText.plaintext,
        ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
    };
};

const listItemToPckt = (item: AstListItem): PcktListItem => ({
    $type: "blog.pckt.block.listItem",
    content: [textBlockFromInlines(item.children)],
});

const blockToPckt = (block: AstBlockNode): PcktBlock | null => {
    switch (block.type) {
        case "paragraph": {
            const richText = inlinesToRichText(block.children);
            if (!richText.plaintext) return null;
            return {
                $type: "blog.pckt.block.text",
                plaintext: richText.plaintext,
                ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
            };
        }

        case "heading":
            return {
                $type: "blog.pckt.block.heading",
                plaintext: inlinesToRichText(block.children).plaintext,
                level: block.level,
            };

        case "blockquote":
            return {
                $type: "blog.pckt.block.blockquote",
                content: block.children.length > 0 ? [textBlockFromInlines(block.children)] : [],
            };

        case "code-block":
            return {
                $type: "blog.pckt.block.codeBlock",
                plaintext: block.text ?? "",
                language: block.language,
            };

        case "media": {
            const image = block.image;
            return {
                $type: "blog.pckt.block.image",
                blob: image,
                ...(block.alt ? { alt: block.alt } : {}),
                attrs: {
                    src: "",
                    blob: image,
                    ...(block.alt ? { alt: block.alt } : {}),
                },
            };
        }

        case "unordered-list":
            return {
                $type: "blog.pckt.block.bulletList",
                content: block.items.map(listItemToPckt),
            };

        case "ordered-list":
            return {
                $type: "blog.pckt.block.orderedList",
                content: block.items.map(listItemToPckt),
                ...(block.start !== undefined ? { attrs: { start: block.start } } : {}),
            };

        case "bsky-post":
            return {
                $type: "blog.pckt.block.blueskyEmbed",
                postRef: { uri: block.uri, cid: block.cid },
            };

        case "horizontal-rule":
            return { $type: "blog.pckt.block.horizontalRule" };

        case "website":
            return {
                $type: "blog.pckt.block.website",
                src: block.uri,
                ...(block.title ? { title: block.title } : {}),
            };

        case "table":
            return {
                $type: "blog.pckt.block.table",
                content: block.rows.map((row) => ({
                    $type: "blog.pckt.block.tableRow" as const,
                    content: row.cells.map((cell) => ({
                        $type: "blog.pckt.block.tableCell" as const,
                        ...(cell.colspan !== undefined || cell.rowspan !== undefined
                            ? { attrs: { colspan: cell.colspan, rowspan: cell.rowspan } }
                            : {}),
                        content: [textBlockFromInlines(cell.content)],
                    })),
                })),
            };

        case "iframe":
            return { $type: "blog.pckt.block.iframe", url: block.url };

        default:
            return null;
    }
};

export const astToData = (ast: AstDocument): { items: PcktBlock[] } => {
    const items: PcktBlock[] = [];
    for (const node of ast) {
        const pckt = blockToPckt(node);
        if (pckt) items.push(pckt);
    }
    return { items };
};
