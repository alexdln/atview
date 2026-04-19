import { type Facet, type LeafletDocumentBlock, type LeafletLinearDocument } from "@src/core/defs/document";
import { charPositionToBytePosition } from "@src/core/utils/byte-helpers";

import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "../../ast/types";

const INLINE_TYPE_TO_FACET: Record<string, string> = {
    bold: "pub.leaflet.richtext.facet#bold",
    italic: "pub.leaflet.richtext.facet#italic",
    underline: "pub.leaflet.richtext.facet#underline",
    "inline-code": "pub.leaflet.richtext.facet#code",
    strikethrough: "pub.leaflet.richtext.facet#strikethrough",
    highlight: "pub.leaflet.richtext.facet#highlight",
};

export interface RichText {
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
            features: [{ $type: "pub.leaflet.richtext.facet#link", uri: node.uri }],
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

const listItemToLeaflet = (item: AstListItem) => {
    const richText = inlinesToRichText(item.children);
    return {
        content: {
            $type: "pub.leaflet.blocks.text" as const,
            plaintext: richText.plaintext,
            ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
        },
        // ...(item.sublist ? { children: item.sublist.items.map(listItemToLeaflet) } : {}),
    };
};

const blockToLeaflet = (block: AstBlockNode): LeafletDocumentBlock | null => {
    const wrap = (leafletBlock: LeafletDocumentBlock["block"]): LeafletDocumentBlock => ({
        $type: "pub.leaflet.pages.linearDocument#block",
        block: leafletBlock,
    });

    switch (block.type) {
        case "paragraph": {
            const richText = inlinesToRichText(block.children);
            return wrap({
                $type: "pub.leaflet.blocks.text",
                plaintext: richText.plaintext,
                ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
            });
        }

        case "heading": {
            const richText = inlinesToRichText(block.children);
            return wrap({
                $type: "pub.leaflet.blocks.header",
                plaintext: richText.plaintext,
                level: block.level,
                ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
            });
        }

        case "blockquote": {
            const richText = inlinesToRichText(block.children);
            return wrap({
                $type: "pub.leaflet.blocks.blockquote",
                plaintext: richText.plaintext,
                ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
            });
        }

        case "code-block":
            return wrap({
                $type: "pub.leaflet.blocks.code",
                plaintext: block.text,
                ...(block.language ? { language: block.language } : {}),
            });

        case "media":
            return wrap({
                $type: "pub.leaflet.blocks.image",
                image: block.image as string,
                aspectRatio: {
                    width: Number(block.width || 0) || 0,
                    height: Number(block.height || 0) || 0,
                },
                ...(block.alt ? { alt: block.alt } : {}),
                ...(block.caption ? { caption: block.caption } : {}),
            });

        case "unordered-list":
            return wrap({
                $type: "pub.leaflet.blocks.unorderedList",
                children: block.items.map(listItemToLeaflet),
            });

        case "ordered-list":
            return wrap({
                $type: "pub.leaflet.blocks.orderedList",
                children: block.items.map(listItemToLeaflet),
                ...(block.start ? { startIndex: block.start } : {}),
            });

        case "bsky-post":
            return wrap({
                $type: "pub.leaflet.blocks.bskyPost",
                postRef: { uri: block.uri, cid: block.cid },
            });

        case "horizontal-rule":
            return wrap({ $type: "pub.leaflet.blocks.horizontalRule" });

        case "website":
            return wrap({
                $type: "pub.leaflet.blocks.website",
                src: block.uri,
                ...(block.title ? { title: block.title } : {}),
            });

        case "iframe":
            return wrap({
                $type: "pub.leaflet.blocks.iframe",
                url: block.url,
                ...(block.height ? { height: block.height } : {}),
            });

        case "math":
            return wrap({
                $type: "pub.leaflet.blocks.math",
                tex: block.content,
            });

        case "hard-break":
            return wrap({ $type: "pub.leaflet.blocks.text", plaintext: "\n" });

        case "table":
            return null;
    }
};

export const astToData = (ast: AstDocument): { pages: LeafletLinearDocument[] } => {
    const blocks: LeafletDocumentBlock[] = [];

    for (const node of ast) {
        const leafletBlock = blockToLeaflet(node);
        if (leafletBlock) blocks.push(leafletBlock);
    }

    return {
        pages: [{ $type: "pub.leaflet.pages.linearDocument", blocks }],
    };
};
