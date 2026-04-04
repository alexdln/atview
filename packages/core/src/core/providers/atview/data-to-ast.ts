import { type Blob, type Facet } from "@src/core/defs/document";
import { bytePositionToCharPosition } from "@src/core/utils/byte-helpers";

import { type AstBlockNode, type AstDocument, type AstInlineNode } from "../../ast/types";

const BLOCK_FACET_TYPES = new Set([
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

export const dataToAst = (data: { textContent: string; facets?: Facet[] }): AstDocument => {
    const { textContent, facets = [] } = data;

    const blocks: AstBlockNode[] = [];
    let pendingInlines: AstInlineNode[] = [];
    let prevEndChar = 0;

    for (const facet of facets) {
        const startChar = bytePositionToCharPosition(textContent, facet.index.byteStart);
        const endChar = bytePositionToCharPosition(textContent, facet.index.byteEnd);
        const feature = facet.features[0];
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

        if (feature.$type in HEADING_LEVELS) {
            blocks.push({
                type: "heading",
                level: HEADING_LEVELS[feature.$type],
                children: [{ type: "text", value: text }],
            });
        } else if (feature.$type === "net.atview.richtext.facet#blockquote") {
            blocks.push({
                type: "blockquote",
                children: [{ type: "text", value: text }],
            });
        } else if (feature.$type === "net.atview.richtext.facet#code-block") {
            blocks.push({
                type: "code-block",
                text,
                ...(feature.language ? { language: String(feature.language) } : {}),
            });
        } else if (feature.$type === "net.atview.richtext.facet#ul") {
            blocks.push({ type: "unordered-list", items: parseListItems(text, /^- /) });
        } else if (feature.$type === "net.atview.richtext.facet#ol") {
            blocks.push({ type: "ordered-list", items: parseListItems(text, /^[0-9]+\. /) });
        } else if (feature.$type === "net.atview.richtext.facet#bsky-post") {
            blocks.push({ type: "bsky-post", uri: String(feature.uri || ""), cid: String(feature.cid || "") });
        } else if (feature.$type === "net.atview.richtext.facet#media") {
            blocks.push({
                type: "media",
                image: (feature.image as string | Blob) || "",
                alt: feature.altText ? String(feature.altText) : undefined,
                width: feature.width ? String(feature.width) : undefined,
                height: feature.height ? String(feature.height) : undefined,
            });
        } else if (feature.$type === "net.atview.richtext.facet#link") {
            pendingInlines.push({
                type: "link",
                uri: String(feature.uri || ""),
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
