import {
    type Facet,
    type OffprintBlock,
    type OffprintListItem,
    type OffprintTaskItem,
    type OffprintTextBlock,
} from "@src/core/defs/document";
import { charPositionToBytePosition } from "@src/core/utils/byte-helpers";

import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstTaskListItem,
} from "../../ast/types";

const INLINE_TYPE_TO_FACET: Record<string, string> = {
    bold: "app.offprint.richtext.facet#bold",
    italic: "app.offprint.richtext.facet#italic",
    underline: "app.offprint.richtext.facet#underline",
    "inline-code": "app.offprint.richtext.facet#code",
    strikethrough: "app.offprint.richtext.facet#strikethrough",
    highlight: "app.offprint.richtext.facet#highlight",
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
            features: [{ $type: "app.offprint.richtext.facet#link", uri: node.uri }],
        });
    } else if (node.type === "mention") {
        richText.facets.push({
            index: { byteStart, byteEnd },
            features: [{ $type: "app.offprint.richtext.facet#mention", did: node.did }],
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

const textBlockFromInlines = (nodes: AstInlineNode[]): OffprintTextBlock => {
    const richText = inlinesToRichText(nodes);
    return {
        $type: "app.offprint.block.text",
        plaintext: richText.plaintext,
        ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
    };
};

const listItemToOffprint = (item: AstListItem): OffprintListItem => {
    const entry: OffprintListItem = { content: textBlockFromInlines(item.children) };
    if (item.sublist && item.sublist.items.length > 0) {
        entry.children = item.sublist.items.map(listItemToOffprint);
    }
    return entry;
};

const taskItemToOffprint = (item: AstTaskListItem): OffprintTaskItem => ({
    checked: item.checked,
    content: textBlockFromInlines(item.children),
});

const blockToOffprint = (block: AstBlockNode): OffprintBlock | null => {
    switch (block.type) {
        case "paragraph": {
            const richText = inlinesToRichText(block.children);
            if (!richText.plaintext) return null;
            return {
                $type: "app.offprint.block.text",
                plaintext: richText.plaintext,
                ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
            };
        }

        case "heading": {
            const level = Math.max(1, Math.min(3, block.level - 1)) as 1 | 2 | 3;
            const richText = inlinesToRichText(block.children);
            return {
                $type: "app.offprint.block.heading",
                plaintext: richText.plaintext,
                level,
                ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
            };
        }

        case "blockquote": {
            const richText = inlinesToRichText(block.children);
            return {
                $type: "app.offprint.block.blockquote",
                content: [
                    {
                        $type: "app.offprint.block.text",
                        plaintext: richText.plaintext,
                        ...(richText.facets.length > 0 ? { facets: richText.facets } : {}),
                    },
                ],
            };
        }

        case "code-block":
            return {
                $type: "app.offprint.block.codeBlock",
                code: block.text ?? "",
                ...(block.language ? { language: block.language } : {}),
            };

        case "media": {
            if (!block.image) return null;
            return {
                $type: "app.offprint.block.image",
                blob: block.image,
                ...(block.alt ? { alt: block.alt } : {}),
                ...(block.caption ? { caption: block.caption } : {}),
                ...(block.width && block.height
                    ? { aspectRatio: { width: Number(block.width), height: Number(block.height) } }
                    : {}),
            };
        }

        case "unordered-list":
            return {
                $type: "app.offprint.block.bulletList",
                children: block.items.map(listItemToOffprint),
            };

        case "ordered-list":
            return {
                $type: "app.offprint.block.orderedList",
                children: block.items.map(listItemToOffprint),
                ...(block.start !== undefined ? { start: block.start } : {}),
            };

        case "task-list":
            return {
                $type: "app.offprint.block.taskList",
                children: block.items.map(taskItemToOffprint),
            };

        case "bsky-post":
            return {
                $type: "app.offprint.block.blueskyPost",
                post: { uri: block.uri, cid: block.cid },
            };

        case "horizontal-rule":
            return { $type: "app.offprint.block.horizontalRule" };

        case "website":
            return {
                $type: "app.offprint.block.webBookmark",
                href: block.uri,
                title: block.title ?? "",
            };

        case "iframe":
            return {
                $type: "app.offprint.block.webEmbed",
                href: block.url,
                embedUrl: block.url,
            };

        case "math":
            return { $type: "app.offprint.block.mathBlock", tex: block.content };

        default:
            return null;
    }
};

export const astToData = (ast: AstDocument): { items: OffprintBlock[] } => {
    const items: OffprintBlock[] = [];
    for (const node of ast) {
        const offprint = blockToOffprint(node);
        if (offprint) items.push(offprint);
    }
    return { items };
};
