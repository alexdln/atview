import { type Facet, type PcktBlock, type PcktListItem, type PcktTableRow } from "@src/core/defs/document";
import { bytePositionToCharPosition } from "@src/core/utils/byte-helpers";

import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstTableCell,
    type AstTableRow,
} from "../../ast/types";

const INLINE_FACET_MAP: Record<string, AstInlineNode["type"]> = {
    "blog.pckt.richtext.facet#bold": "bold",
    "blog.pckt.richtext.facet#italic": "italic",
    "blog.pckt.richtext.facet#underline": "underline",
    "blog.pckt.richtext.facet#code": "inline-code",
    "blog.pckt.richtext.facet#strikethrough": "strikethrough",
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
            if (feature.$type === "blog.pckt.richtext.facet#link") {
                node = { type: "link", uri: String(feature.uri || ""), children: [node] };
            } else if (feature.$type === "blog.pckt.richtext.facet#didMention") {
                node = { type: "mention", did: String(feature.did || ""), children: [node] };
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

const blocksToInline = (blocks: PcktBlock[]): AstInlineNode[] =>
    blocks.flatMap((block) => {
        if (block.$type === "blog.pckt.block.text") {
            return facetsToInline(block.plaintext, block.facets);
        }
        return [];
    });

const listItemToAst = (item: PcktListItem): AstListItem => ({
    children: blocksToInline(item.content),
});

const tableRowToAst = (row: PcktTableRow): AstTableRow => ({
    cells: row.content.map(
        (cell): AstTableCell => ({
            content: blocksToInline(cell.content),
            colspan: cell.attrs?.colspan,
            rowspan: cell.attrs?.rowspan,
        }),
    ),
});

const blockToAst = (block: PcktBlock): AstBlockNode | null => {
    switch (block.$type) {
        case "blog.pckt.block.text":
            return block.plaintext
                ? { type: "paragraph", children: facetsToInline(block.plaintext, block.facets) }
                : null;

        case "blog.pckt.block.heading": {
            const level = Math.max(2, Math.min(6, block.level)) as 2 | 3 | 4 | 5 | 6;
            return { type: "heading", level, children: [{ type: "text", value: block.plaintext }] };
        }

        case "blog.pckt.block.image":
            const image = block.blob || block.attrs?.blob;
            const alt = block.alt || block.attrs?.alt;
            return {
                type: "media",
                image,
                alt: alt,
            };

        case "blog.pckt.block.website":
            const src = block.src || block.attrs?.src || "";
            const title = block.title || block.attrs?.title;
            return { type: "website", uri: src, title: title };

        case "blog.pckt.block.blueskyEmbed":
            const postRef = block.postRef || block.attrs?.postRef;
            return { type: "bsky-post", uri: postRef.uri, cid: postRef.cid };

        case "blog.pckt.block.blockquote":
            return { type: "blockquote", children: blocksToInline(block.content) };

        case "blog.pckt.block.horizontalRule":
            return { type: "horizontal-rule" };

        case "blog.pckt.block.orderedList":
            return {
                type: "ordered-list",
                items: block.content?.map(listItemToAst),
                start: block.attrs?.start,
            };

        case "blog.pckt.block.bulletList":
            return { type: "unordered-list", items: block.content?.map(listItemToAst) };

        case "blog.pckt.block.table":
            return { type: "table", rows: block.content?.map(tableRowToAst) };

        case "blog.pckt.block.iframe":
            const url = block.url || block.attrs?.url || "";
            return { type: "iframe", url };

        case "blog.pckt.block.codeBlock":
            return { type: "code-block", text: block.plaintext, language: block.language };

        default:
            return null;
    }
};

export const dataToAst = ({ items }: { items: PcktBlock[] }): AstDocument => {
    const blocks: AstBlockNode[] = [];
    for (const item of items) {
        const node = blockToAst(item);
        if (node) blocks.push(node);
    }
    return blocks;
};
