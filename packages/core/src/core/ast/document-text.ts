import { type AstBlockNode, type AstInlineNode } from "./types";

const ZERO_WIDTH_SPACES = /\u200B/g;

export const cloneNodesIntoWrapper = (ownerDocument: Document, nodes: Node[]): HTMLElement => {
    const wrapper = ownerDocument.createElement("div");
    for (const node of nodes) {
        wrapper.appendChild(node.cloneNode(true));
    }
    return wrapper;
};

export const cleanText = (text: string) => text.replace(ZERO_WIDTH_SPACES, "").replace(/\r/g, "");

/**
 * After merging adjacent text nodes from HTML paste: strip indentation (spaces/tabs after each newline),
 * then cap 3+ consecutive newlines at two. The first pass fixes patterns like `\n  \n  \n    ` that are
 * not matched by `\n{3,}` alone.
 */
export const collapseExcessiveNewlines = (text: string): string => {
    let prev: string;
    let cur = text;
    do {
        prev = cur;
        cur = cur.replace(/\n[ \t]+/g, "\n");
    } while (cur !== prev);
    return cur.replace(/\n{3,}/g, "\n\n");
};

const mergeAdjacentTextNodes = (nodes: AstInlineNode[]): AstInlineNode[] => {
    const out: AstInlineNode[] = [];
    for (const node of nodes) {
        const last = out[out.length - 1];
        if (node.type === "text" && last?.type === "text") {
            out[out.length - 1] = { type: "text", value: last.value + node.value };
        } else {
            out.push(node);
        }
    }
    return out;
};

const normalizeInlineChildrenDeep = (node: AstInlineNode): AstInlineNode => {
    if (node.type === "text") return node;
    if ("children" in node && node.children.length > 0) {
        return { ...node, children: normalizeInlineParagraphWhitespace(node.children) } as AstInlineNode;
    }
    return node;
};

/**
 * Pretty-printed HTML (nested divs, etc.) yields many separate whitespace text nodes that merge into long
 * newline runs. Merge adjacent text nodes, then cap consecutive newlines at two.
 */
export const normalizeInlineParagraphWhitespace = (nodes: AstInlineNode[]): AstInlineNode[] => {
    const withNormalizedChildren = nodes.map(normalizeInlineChildrenDeep);
    const merged = mergeAdjacentTextNodes(withNormalizedChildren);
    return merged.map((node) =>
        node.type === "text" ? { ...node, value: collapseExcessiveNewlines(node.value) } : node,
    );
};

export const splitParagraphs = (nodes: AstInlineNode[]): AstBlockNode[] => {
    const blocks: AstBlockNode[] = [];
    let queueNodes: AstInlineNode[] = [];
    nodes.forEach((node) => {
        if (node.type === "text" && node.value.includes("\n\n")) {
            const textParagraphs = node.value.split("\n\n");
            textParagraphs.slice(0, -1).forEach((text) => {
                if (!text.trim()) return;
                blocks.push({ type: "paragraph", children: [...queueNodes, { type: "text", value: text }] });
                queueNodes = [];
            });
            const paragraphValue = textParagraphs[textParagraphs.length - 1];
            if (paragraphValue) {
                queueNodes = [...queueNodes, { type: "text", value: paragraphValue }];
            }
        } else {
            queueNodes.push(node);
        }
    });

    if (queueNodes.length > 0) {
        blocks.push({ type: "paragraph", children: queueNodes });
    }
    return blocks;
};
