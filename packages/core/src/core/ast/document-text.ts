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
