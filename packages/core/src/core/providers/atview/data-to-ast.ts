import { type AtviewFacet, type AtviewFeature } from "@src/core/defs/document";
import { bytePositionToCharPosition } from "@src/core/utils/byte-helpers";

import { type AstBlockNode, type AstDocument, type AstInlineNode } from "../../ast/types";

const BLOCK_FACET_TYPES = new Set<AtviewFeature["$type"]>([
    "net.atview.richtext.facet#h2",
    "net.atview.richtext.facet#h3",
    "net.atview.richtext.facet#h4",
    "net.atview.richtext.facet#h5",
    "net.atview.richtext.facet#h6",
    "net.atview.richtext.facet#blockquote",
    "net.atview.richtext.facet#code-block",
    "net.atview.richtext.facet#media",
    "net.atview.richtext.facet#bsky-post",
    "net.atview.richtext.facet#ul",
    "net.atview.richtext.facet#ol",
    "net.atview.richtext.facet#website",
    "net.atview.richtext.facet#horizontal-rule",
    "net.atview.richtext.facet#iframe",
    "net.atview.richtext.facet#math",
    "net.atview.richtext.facet#hard-break",
]);

const HEADING_LEVELS: Record<string, 2 | 3 | 4 | 5 | 6> = {
    "net.atview.richtext.facet#h2": 2,
    "net.atview.richtext.facet#h3": 3,
    "net.atview.richtext.facet#h4": 4,
    "net.atview.richtext.facet#h5": 5,
    "net.atview.richtext.facet#h6": 6,
};

const INLINE_FACET_MAP: Record<string, AstInlineNode["type"]> = {
    "net.atview.richtext.facet#b": "bold",
    "net.atview.richtext.facet#i": "italic",
    "net.atview.richtext.facet#u": "underline",
    "net.atview.richtext.facet#code": "inline-code",
    "net.atview.richtext.facet#strikethrough": "strikethrough",
    "net.atview.richtext.facet#highlight": "highlight",
};

const wrapInline = (type: AstInlineNode["type"], text: string): AstInlineNode => {
    const children: AstInlineNode[] = [{ type: "text", value: text }];
    return { type, children } as AstInlineNode;
};

const parseListItems = (text: string, marker: RegExp) =>
    text
        .split("\n")
        .map((line) => line.trim().replace(marker, ""))
        .filter(Boolean)
        .map((item) => ({ children: [{ type: "text" as const, value: item }] }));

const featureToBlock = (feature: AtviewFeature, text: string): AstBlockNode | null => {
    switch (feature.$type) {
        case "net.atview.richtext.facet#h2":
        case "net.atview.richtext.facet#h3":
        case "net.atview.richtext.facet#h4":
        case "net.atview.richtext.facet#h5":
        case "net.atview.richtext.facet#h6":
            return {
                type: "heading",
                level: HEADING_LEVELS[feature.$type],
                children: [{ type: "text", value: text }],
            };

        case "net.atview.richtext.facet#blockquote":
            return { type: "blockquote", children: [{ type: "text", value: text }] };

        case "net.atview.richtext.facet#code-block":
            return {
                type: "code-block",
                text,
                ...(feature.language ? { language: feature.language } : {}),
            };

        case "net.atview.richtext.facet#ul":
            return { type: "unordered-list", items: parseListItems(text, /^- /) };

        case "net.atview.richtext.facet#ol":
            return { type: "ordered-list", items: parseListItems(text, /^[0-9]+\. /) };

        case "net.atview.richtext.facet#bsky-post":
            return { type: "bsky-post", uri: feature.uri, cid: feature.cid ?? "" };

        case "net.atview.richtext.facet#website":
            return { type: "website", uri: feature.uri, title: feature.title ?? "" };

        case "net.atview.richtext.facet#media":
            return {
                type: "media",
                text,
                image: feature.image,
                alt: feature.altText,
                width: feature.aspectRatio?.width ? Number(feature.aspectRatio.width) : undefined,
                height: feature.aspectRatio?.height ? Number(feature.aspectRatio.height) : undefined,
                title: feature.title,
                caption: feature.caption,
            };

        case "net.atview.richtext.facet#horizontal-rule":
            return { type: "horizontal-rule" };

        case "net.atview.richtext.facet#iframe":
            return { type: "iframe", url: feature.url };

        case "net.atview.richtext.facet#math":
            return { type: "math", content: text };

        case "net.atview.richtext.facet#hard-break":
            return { type: "hard-break" };

        default:
            return null;
    }
};

export const dataToAst = (data: { textContent: string; facets?: AtviewFacet[] }): AstDocument => {
    const { textContent, facets = [] } = data;

    const blocks: AstBlockNode[] = [];
    let pendingInlines: AstInlineNode[] = [];
    let prevEndChar = 0;

    for (const facet of facets) {
        const startChar = bytePositionToCharPosition(textContent, facet.index.byteStart);
        const endChar = bytePositionToCharPosition(textContent, facet.index.byteEnd);
        const feature = facet.features[0];

        if (!feature) continue;

        const isBlock = BLOCK_FACET_TYPES.has(feature.$type);
        const text = textContent.substring(startChar, endChar);

        if (startChar > prevEndChar) {
            const gap = textContent.substring(prevEndChar, startChar);
            const paragraphs = gap.split("\n\n");
            paragraphs.slice(0, -1).forEach((paragraph) => {
                if (!paragraph && !pendingInlines.length) return;
                blocks.push({ type: "paragraph", children: [...pendingInlines, { type: "text", value: paragraph }] });
                pendingInlines = [];
            });
            const lastParagraph = paragraphs[paragraphs.length - 1];
            if (lastParagraph) {
                pendingInlines.push({ type: "text", value: lastParagraph });
            }
        }

        if (isBlock && pendingInlines.length > 0) {
            blocks.push({ type: "paragraph", children: pendingInlines });
            pendingInlines = [];
        }

        if (isBlock) {
            const block = featureToBlock(feature, text);
            if (block) blocks.push(block);
        } else if (feature.$type === "net.atview.richtext.facet#link") {
            pendingInlines.push({
                type: "link",
                uri: feature.uri,
                children: [{ type: "text", value: text }],
            });
        } else if (feature.$type === "net.atview.richtext.facet#mention") {
            pendingInlines.push({
                type: "mention",
                did: feature.did,
                children: [{ type: "text", value: text }],
            });
        } else if (feature.$type in INLINE_FACET_MAP) {
            pendingInlines.push(wrapInline(INLINE_FACET_MAP[feature.$type], text));
        }

        prevEndChar = endChar;
    }

    const remaining = textContent.substring(prevEndChar);
    if (remaining || pendingInlines.length) {
        const paragraphs = remaining.split("\n\n");
        paragraphs.forEach((paragraph) => {
            if (!paragraph && !pendingInlines.length) return;
            blocks.push({ type: "paragraph", children: [...pendingInlines, { type: "text", value: paragraph }] });
            pendingInlines = [];
        });
    }

    return blocks;
};
