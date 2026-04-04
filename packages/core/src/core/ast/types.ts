import { type Blob } from "@src/core/defs/document";

export interface AstTextNode {
    type: "text";
    value: string;
}

export interface AstBoldNode {
    type: "bold";
    children: AstInlineNode[];
}

export interface AstItalicNode {
    type: "italic";
    children: AstInlineNode[];
}

export interface AstUnderlineNode {
    type: "underline";
    children: AstInlineNode[];
}

export interface AstStrikethroughNode {
    type: "strikethrough";
    children: AstInlineNode[];
}

export interface AstHighlightNode {
    type: "highlight";
    children: AstInlineNode[];
}

export interface AstInlineCodeNode {
    type: "inline-code";
    children: AstInlineNode[];
}

export interface AstLinkNode {
    type: "link";
    uri: string;
    children: AstInlineNode[];
}

export interface AstMentionNode {
    type: "mention";
    did: string;
    children: AstInlineNode[];
}

export type AstInlineNode =
    | AstTextNode
    | AstBoldNode
    | AstItalicNode
    | AstUnderlineNode
    | AstStrikethroughNode
    | AstHighlightNode
    | AstInlineCodeNode
    | AstLinkNode
    | AstMentionNode;

export interface AstParagraphNode {
    type: "paragraph";
    children: AstInlineNode[];
}

export interface AstHeadingNode {
    type: "heading";
    level: 2 | 3 | 4 | 5 | 6;
    children: AstInlineNode[];
}

export interface AstBlockquoteNode {
    type: "blockquote";
    children: AstInlineNode[];
}

export interface AstCodeBlockNode {
    type: "code-block";
    text: string;
    language?: string;
}

export interface AstMediaNode {
    type: "media";
    image: string | Blob;
    alt?: string;
    width?: string;
    height?: string;
}

export interface AstListItem {
    children: AstInlineNode[];
    sublist?: AstUnorderedListNode | AstOrderedListNode;
}

export interface AstUnorderedListNode {
    type: "unordered-list";
    items: AstListItem[];
}

export interface AstOrderedListNode {
    type: "ordered-list";
    items: AstListItem[];
    start?: number;
}

export interface AstBskyPostNode {
    type: "bsky-post";
    uri: string;
    cid: string;
}

export interface AstHorizontalRuleNode {
    type: "horizontal-rule";
}

export interface AstWebsiteNode {
    type: "website";
    uri: string;
    title?: string;
}

export interface AstTableCell {
    content: AstInlineNode[];
    colspan?: number;
    rowspan?: number;
}

export interface AstTableRow {
    cells: AstTableCell[];
}

export interface AstTableNode {
    type: "table";
    rows: AstTableRow[];
}

export interface AstIframeNode {
    type: "iframe";
    url: string;
}

export type AstBlockNode =
    | AstParagraphNode
    | AstHeadingNode
    | AstBlockquoteNode
    | AstCodeBlockNode
    | AstMediaNode
    | AstUnorderedListNode
    | AstOrderedListNode
    | AstBskyPostNode
    | AstHorizontalRuleNode
    | AstWebsiteNode
    | AstTableNode
    | AstIframeNode;

export type AstDocument = AstBlockNode[];
