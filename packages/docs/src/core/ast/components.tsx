import { BskyPost } from "@src/blocks/bsky-post/index.isomorphic";
import { Media } from "@src/blocks/media";
import { CodeBlock } from "@src/blocks/code-block";
import { Website } from "@src/blocks/website";
import { MathBlock } from "@src/blocks/math-block";
import {
    Bold,
    Italic,
    Underline,
    InlineCode,
    Strikethrough,
    Highlight,
    Link,
    Mention,
    Paragraph,
    Heading,
    Blockquote,
    UnorderedList,
    OrderedList,
    Iframe,
    Table,
    TableCell,
    TableHeadCell,
    UnknownBlock,
} from "@atview/ui";

export const InlineElements = {
    bold: Bold,
    italic: Italic,
    underline: Underline,
    inlineCode: InlineCode,
    strikethrough: Strikethrough,
    highlight: Highlight,
    link: Link,
    mention: Mention,
};

export const BlockElements = {
    paragraph: Paragraph,
    heading: Heading,
    blockquote: Blockquote,
    codeBlock: CodeBlock,
    media: Media,
    unorderedList: UnorderedList,
    orderedList: OrderedList,
    listItem: "li" as React.ElementType,
    bskyPost: BskyPost,
    horizontalRule: "hr" as React.ElementType,
    website: Website,
    iframe: Iframe,
    table: Table,
    tableBody: "tbody" as React.ElementType,
    tableHead: "thead" as React.ElementType,
    tableRow: "tr" as React.ElementType,
    tableCell: TableCell,
    tableHeadCell: TableHeadCell,
    unknown: UnknownBlock,
    math: MathBlock,
};
