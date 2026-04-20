import {
    type Facet,
    type OffprintBlock,
    type OffprintListItem,
    type OffprintTaskItem,
    type OffprintTextBlock,
} from "../../defs/document";
import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstOrderedListNode,
    type AstTaskListItem,
    type AstUnorderedListNode,
} from "../../ast/types";
import { bytePositionToCharPosition } from "../../utils/byte-helpers";

const INLINE_FACET_MAP: Record<string, AstInlineNode["type"]> = {
    "app.offprint.richtext.facet#bold": "bold",
    "app.offprint.richtext.facet#italic": "italic",
    "app.offprint.richtext.facet#underline": "underline",
    "app.offprint.richtext.facet#code": "inline-code",
    "app.offprint.richtext.facet#strikethrough": "strikethrough",
    "app.offprint.richtext.facet#highlight": "highlight",
};

const facetsToInline = (plaintext: string, facets?: Facet[]): AstInlineNode[] => {
    if (!facets || facets.length === 0) return [{ type: "text", value: plaintext }];

    const sorted = [...facets].sort((a, b) =>
        a.index.byteStart !== b.index.byteStart
            ? a.index.byteStart - b.index.byteStart
            : a.index.byteEnd - b.index.byteEnd,
    );

    const nodes: AstInlineNode[] = [];
    let prevEndChar = 0;

    for (const facet of sorted) {
        const startChar = bytePositionToCharPosition(plaintext, facet.index.byteStart);
        const endChar = bytePositionToCharPosition(plaintext, facet.index.byteEnd);

        if (startChar > prevEndChar) {
            nodes.push({ type: "text", value: plaintext.substring(prevEndChar, startChar) });
        }

        const text = plaintext.substring(startChar, endChar);
        let node: AstInlineNode = { type: "text", value: text };

        for (const feature of facet.features) {
            if (feature.$type === "app.offprint.richtext.facet#link") {
                node = { type: "link", uri: String(feature.uri || ""), children: [node] };
            } else if (
                feature.$type === "app.offprint.richtext.facet#webMention" ||
                feature.$type === "app.offprint.richtext.facet#webmention"
            ) {
                node = { type: "link", uri: String(feature.uri || ""), children: [node] };
            } else if (feature.$type === "app.offprint.richtext.facet#mention") {
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

const textBlockToInline = (block: OffprintTextBlock): AstInlineNode[] => facetsToInline(block.plaintext, block.facets);

type OffprintListNode = { $type: "app.offprint.block.bulletList" | "app.offprint.block.orderedList" };

const listItemsToAst = (items: OffprintListItem[], parent: OffprintListNode, start?: number): AstListItem[] =>
    items.map((item) => {
        const children = textBlockToInline(item.content);
        const ast: AstListItem = { children };
        if (item.children && item.children.length > 0) {
            ast.sublist = nestedListToAst(item.children, parent, start);
        }
        return ast;
    });

const nestedListToAst = (
    items: OffprintListItem[],
    parent: OffprintListNode,
    start?: number,
): AstUnorderedListNode | AstOrderedListNode => {
    if (parent.$type === "app.offprint.block.orderedList") {
        return {
            type: "ordered-list",
            items: listItemsToAst(items, parent, start),
            ...(start !== undefined ? { start } : {}),
        };
    }
    return { type: "unordered-list", items: listItemsToAst(items, parent) };
};

const flattenTaskItems = (items: OffprintTaskItem[]): OffprintTaskItem[] => {
    const flat: OffprintTaskItem[] = [];
    const walk = (list: OffprintTaskItem[]) => {
        for (const item of list) {
            flat.push(item);
            if (item.children && item.children.length > 0) walk(item.children);
        }
    };
    walk(items);
    return flat;
};

const taskItemsToAst = (items: OffprintTaskItem[]): AstTaskListItem[] =>
    flattenTaskItems(items).map((item) => ({
        checked: item.checked,
        children: textBlockToInline(item.content),
    }));

const blockToAst = (block: OffprintBlock): AstBlockNode | AstBlockNode[] | null => {
    switch (block.$type) {
        case "app.offprint.block.text":
            return { type: "paragraph", children: textBlockToInline(block) };

        case "app.offprint.block.heading":
            const level = Math.max(2, Math.min(4, block.level + 1)) as 2 | 3 | 4;
            return {
                type: "heading",
                level,
                children: facetsToInline(block.plaintext, block.facets),
            };

        case "app.offprint.block.blockquote": {
            const inlines: AstInlineNode[] = [];
            block.content.forEach((inner, index) => {
                if (index > 0) inlines.push({ type: "text", value: "\n" });
                inlines.push(...facetsToInline(inner.plaintext, inner.facets));
            });
            return { type: "blockquote", children: inlines };
        }

        case "app.offprint.block.bulletList":
            return {
                type: "unordered-list",
                items: listItemsToAst(block.children, { $type: "app.offprint.block.bulletList" }),
            };

        case "app.offprint.block.orderedList":
            return {
                type: "ordered-list",
                items: listItemsToAst(block.children, { $type: "app.offprint.block.orderedList" }, block.start),
                ...(block.start !== undefined ? { start: block.start } : {}),
            };

        case "app.offprint.block.taskList":
            return { type: "task-list", items: taskItemsToAst(block.children) };

        case "app.offprint.block.codeBlock":
            return {
                type: "code-block",
                text: block.code,
                ...(block.language ? { language: block.language } : {}),
            };

        case "app.offprint.block.horizontalRule":
            return { type: "horizontal-rule" };

        case "app.offprint.block.image": {
            if (!block.blob) return null;
            return {
                type: "media",
                image: block.blob,
                ...(block.alt ? { alt: block.alt } : {}),
                ...(block.aspectRatio ? { width: block.aspectRatio.width, height: block.aspectRatio.height } : {}),
                ...(block.caption ? { caption: block.caption } : {}),
            };
        }

        case "app.offprint.block.mathBlock":
            return { type: "math", content: block.tex };

        case "app.offprint.block.blueskyPost":
            return { type: "bsky-post", uri: block.post.uri, cid: block.post.cid };

        case "app.offprint.block.webBookmark":
            return { type: "website", uri: block.href, title: block.title };

        case "app.offprint.block.webEmbed":
            return { type: "iframe", url: block.embedUrl || block.href };

        case "app.offprint.block.callout":
            return {
                type: "blockquote",
                children: facetsToInline(block.plaintext, block.facets),
            };

        case "app.offprint.block.imageGrid":
        case "app.offprint.block.imageCarousel":
        case "app.offprint.block.imageDiff":
        case "app.offprint.block.button":
            return null;

        default:
            return null;
    }
};

export const dataToAst = ({ items }: { items: OffprintBlock[] }): AstDocument => {
    const blocks: AstBlockNode[] = [];
    for (const item of items) {
        const result = blockToAst(item);

        if (!result) continue;

        if (Array.isArray(result)) {
            blocks.push(...result);
        } else {
            blocks.push(result);
        }
    }
    return blocks;
};
