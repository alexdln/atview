import { type Facet, type LeafletBlock, type LeafletLinearDocument, type LeafletListItem } from "../../defs/document";
import { type AstBlockNode, type AstDocument, type AstInlineNode, type AstListItem } from "../../ast/types";
import { bytePositionToCharPosition } from "../../utils/byte-helpers";

const INLINE_FACET_MAP: Record<string, AstInlineNode["type"]> = {
    "pub.leaflet.richtext.facet#bold": "bold",
    "pub.leaflet.richtext.facet#italic": "italic",
    "pub.leaflet.richtext.facet#underline": "underline",
    "pub.leaflet.richtext.facet#code": "inline-code",
    "pub.leaflet.richtext.facet#strikethrough": "strikethrough",
    "pub.leaflet.richtext.facet#highlight": "highlight",
};

const facetsToInline = (plaintext: string, facets?: Facet[]): AstInlineNode[] => {
    if (!facets || facets.length === 0) return [{ type: "text", value: plaintext }];

    const nodes: AstInlineNode[] = [];
    let prevEndChar = 0;

    for (const facet of facets) {
        const startChar = bytePositionToCharPosition(plaintext, facet.index.byteStart);
        const endChar = bytePositionToCharPosition(plaintext, facet.index.byteEnd);

        if (startChar > prevEndChar) {
            nodes.push({ type: "text", value: plaintext.substring(prevEndChar, startChar) });
        }

        const text = plaintext.substring(startChar, endChar);
        let node: AstInlineNode = { type: "text", value: text };

        for (const feature of facet.features) {
            if (feature.$type === "pub.leaflet.richtext.facet#link") {
                node = { type: "link", uri: String(feature.uri || ""), children: [node] };
            } else if (feature.$type in INLINE_FACET_MAP) {
                node = { type: INLINE_FACET_MAP[feature.$type], children: [node] } as AstInlineNode;
            }
        }

        nodes.push(node);
        prevEndChar = endChar;
    }

    if (prevEndChar < plaintext.length) {
        nodes.push({ type: "text", value: plaintext.substring(prevEndChar) });
    }

    return nodes;
};

const leafletListItemToAst = (item: LeafletListItem): AstListItem => {
    const children: AstInlineNode[] =
        "plaintext" in item.content
            ? facetsToInline(item.content.plaintext, item.content.facets)
            : [{ type: "text", value: "" }];

    const sublist = item.children?.length
        ? ({ type: "unordered-list", items: item.children.map(leafletListItemToAst) } as const)
        : undefined;

    return { children, sublist };
};

const blockToAst = (block: LeafletBlock): AstBlockNode | null => {
    switch (block.$type) {
        case "pub.leaflet.blocks.text":
            return { type: "paragraph", children: facetsToInline(block.plaintext, block.facets) };

        case "pub.leaflet.blocks.header": {
            const level = Math.max(2, Math.min(6, block.level || 2)) as 2 | 3 | 4 | 5 | 6;
            return { type: "heading", level, children: facetsToInline(block.plaintext, block.facets) };
        }

        case "pub.leaflet.blocks.blockquote":
            return { type: "blockquote", children: facetsToInline(block.plaintext, block.facets) };

        case "pub.leaflet.blocks.code":
            return {
                type: "code-block",
                text: block.plaintext,
                ...(block.language ? { language: block.language } : {}),
            };

        case "pub.leaflet.blocks.image":
            return {
                type: "media",
                image: block.image,
                alt: block.alt,
                caption: block.caption,
                width: block.aspectRatio?.width ? Number(block.aspectRatio.width) : undefined,
                height: block.aspectRatio?.height ? Number(block.aspectRatio.height) : undefined,
            };

        case "pub.leaflet.blocks.unorderedList":
            return { type: "unordered-list", items: block.children.map(leafletListItemToAst) };

        case "pub.leaflet.blocks.orderedList":
            return {
                type: "ordered-list",
                items: block.children.map(leafletListItemToAst),
                start: block.startIndex,
            };

        case "pub.leaflet.blocks.bskyPost":
            return { type: "bsky-post", uri: block.postRef.uri, cid: block.postRef.cid };

        case "pub.leaflet.blocks.horizontalRule":
            return { type: "horizontal-rule" };

        case "pub.leaflet.blocks.website":
            return { type: "website", uri: block.src, title: block.title };

        case "pub.leaflet.blocks.iframe":
            return { type: "iframe", url: block.url, height: block.height };

        case "pub.leaflet.blocks.math":
            return { type: "math", content: block.tex };

        default:
            return null;
    }
};

export const dataToAst = (data: { pages: LeafletLinearDocument[] }): AstDocument => {
    const blocks: AstBlockNode[] = [];

    for (const page of data.pages) {
        if (page.$type !== "pub.leaflet.pages.linearDocument") continue;
        for (const { block } of page.blocks) {
            const node = blockToAst(block);
            if (node) blocks.push(node);
        }
    }

    return blocks;
};
