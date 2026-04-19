import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstOrderedListNode,
    type AstUnorderedListNode,
} from "../../ast/types";

const plainInline = (node: AstInlineNode): string => {
    if (node.type === "text") return node.value;
    return node.children.map(plainInline).join("");
};

const plainNestedList = (block: AstUnorderedListNode | AstOrderedListNode): string => {
    if (block.type === "unordered-list") {
        return block.items.map((item) => `- ${plainListItem(item)}`).join("\n");
    }
    const start = block.start ?? 1;
    return block.items.map((item, index) => `${String(start + index)}. ${plainListItem(item)}`).join("\n");
};

const plainListItem = (item: AstListItem): string => {
    let text = item.children.map(plainInline).join("");
    if (item.sublist) {
        text += `\n${plainNestedList(item.sublist)}`;
    }
    return text;
};

const renderListText = (items: AstListItem[], marker: (i: number) => string): string =>
    items.map((item, index) => `${marker(index)}${plainListItem(item)}`).join("\n");

const processBlock = (block: AstBlockNode, collector: { text: string }, isFirst: boolean) => {
    if (!isFirst && collector.text.length > 0) {
        collector.text += "\n\n";
    }

    switch (block.type) {
        case "paragraph":
            collector.text += block.children.map(plainInline).join("");
            break;
        case "heading":
            collector.text += block.children.map(plainInline).join("");
            break;
        case "blockquote":
            collector.text += block.children.map(plainInline).join("");
            break;
        case "code-block":
            collector.text += block.text;
            break;
        case "media":
            collector.text += block.text ?? "";
            break;
        case "unordered-list":
            collector.text += renderListText(block.items, () => "- ");
            break;
        case "ordered-list": {
            const start = block.start ?? 1;
            collector.text += renderListText(block.items, (i) => `${String(start + i)}. `);
            break;
        }
        case "task-list":
            collector.text += block.items
                .map((item) => `${item.checked ? "- [x] " : "- [ ] "}${item.children.map(plainInline).join("")}`)
                .join("\n");
            break;
        case "bsky-post":
            collector.text += block.text ?? "";
            break;
        case "website":
            collector.text += block.title || block.uri;
            break;
        case "hard-break":
            collector.text += "\n";
            break;
        case "horizontal-rule":
            collector.text += "\n---\n";
            break;
        case "table":
        case "iframe":
            break;
    }
};

export const astToData = (ast: AstDocument): { textContent: string } => {
    const collector = { text: "" };
    ast.forEach((block, index) => processBlock(block, collector, index === 0));
    return { textContent: collector.text.replace(/\n{4,}/g, "\n\n\n") };
};
