import React, { Fragment } from "react";

import { createSlugGenerator } from "../utils/slugify";

import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstTableRow,
} from "@atview/core";
import { InlineElements, BlockElements } from "./components";

export interface RenderContext {
    authorDid: string;
    inlineElements?: Partial<typeof InlineElements>;
    blockElements?: Partial<typeof BlockElements>;
    slugGenerator?: (text: string) => string;
}

export type Headings = { id: string; text: string; nested: boolean }[];

export interface RenderContextInternal extends Required<RenderContext> {
    inlineElements: typeof InlineElements;
    blockElements: typeof BlockElements;
    headings: Headings;
}

const renderInline = (node: AstInlineNode, key: string, ctx: RenderContextInternal): React.ReactNode => {
    if (node.type === "text") {
        return <Fragment key={key}>{node.value}</Fragment>;
    }

    const children = node.children.map((child, i) => renderInline(child, `${key}-${i.toString()}`, ctx));

    const { inlineElements } = ctx;
    switch (node.type) {
        case "bold":
            return <inlineElements.bold key={key}>{children}</inlineElements.bold>;
        case "italic":
            return <inlineElements.italic key={key}>{children}</inlineElements.italic>;
        case "underline":
            return <inlineElements.underline key={key}>{children}</inlineElements.underline>;
        case "inline-code":
            return <inlineElements.inlineCode key={key}>{children}</inlineElements.inlineCode>;
        case "strikethrough":
            return <inlineElements.strikethrough key={key}>{children}</inlineElements.strikethrough>;
        case "highlight":
            return <inlineElements.highlight key={key}>{children}</inlineElements.highlight>;
        case "link":
            return (
                <inlineElements.link key={key} href={node.uri}>
                    {children}
                </inlineElements.link>
            );
        case "mention":
            return (
                <inlineElements.mention key={key} did={node.did}>
                    {children}
                </inlineElements.mention>
            );
    }
};

const renderInlineList = (nodes: AstInlineNode[], keyPrefix: string, ctx: RenderContextInternal): React.ReactNode[] =>
    nodes.map((node, i) => renderInline(node, `${keyPrefix}-${i.toString()}`, ctx));

const renderListItems = (items: AstListItem[], keyPrefix: string, ctx: RenderContextInternal): React.ReactNode[] =>
    items.map((item, i) => {
        const itemKey = `${keyPrefix}-${i.toString()}`;
        const content = renderInlineList(item.children, itemKey, ctx);
        const nested = item.sublist ? renderBlock(item.sublist, itemKey, ctx) : null;
        return (
            <ctx.blockElements.listItem key={itemKey}>
                {content}
                {nested}
            </ctx.blockElements.listItem>
        );
    });

const renderTableRows = (
    rows: AstTableRow[],
    keyPrefix: string,
    ctx: RenderContextInternal,
    isHeader?: boolean,
): React.ReactNode[] =>
    rows.map((row, index) => {
        const rowKey = `${keyPrefix}-r${index.toString()}`;
        return (
            <ctx.blockElements.tableRow key={rowKey}>
                {row.cells.map((cell, cellIndex) => {
                    const cellKey = `${rowKey}-c${cellIndex.toString()}`;
                    const Tag = isHeader ? ctx.blockElements.tableHeadCell : ctx.blockElements.tableCell;
                    return (
                        <Tag key={cellKey} colSpan={cell.colspan} rowSpan={cell.rowspan}>
                            {renderInlineList(cell.content, cellKey, ctx)}
                        </Tag>
                    );
                })}
            </ctx.blockElements.tableRow>
        );
    });

const renderBlock = (block: AstBlockNode, key: string, ctx: RenderContextInternal): React.ReactNode => {
    const { blockElements } = ctx;
    switch (block.type) {
        case "paragraph":
            return (
                <blockElements.paragraph key={key}>
                    {renderInlineList(block.children, key, ctx)}
                </blockElements.paragraph>
            );

        case "heading": {
            const text = block.children.map((node) => (node.type === "text" ? node.value : "")).join("");
            const slug = ctx.slugGenerator(text);
            ctx.headings.push({ id: slug, text, nested: block.level > 2 });

            return (
                <blockElements.heading level={block.level} id={slug} key={slug}>
                    {renderInlineList(block.children, key, ctx)}
                </blockElements.heading>
            );
        }

        case "blockquote":
            return (
                <blockElements.blockquote key={key}>
                    {renderInlineList(block.children, key, ctx)}
                </blockElements.blockquote>
            );

        case "code-block":
            return <blockElements.codeBlock key={key} text={block.text} language={block.language} />;

        case "media":
            return (
                <blockElements.media
                    key={key}
                    authorDid={ctx.authorDid}
                    alt={block.alt}
                    image={block.image}
                    width={block.width}
                    height={block.height}
                />
            );

        case "unordered-list":
            return (
                <blockElements.unorderedList key={key}>
                    {renderListItems(block.items, key, ctx)}
                </blockElements.unorderedList>
            );

        case "ordered-list":
            return (
                <blockElements.orderedList key={key} start={block.start}>
                    {renderListItems(block.items, key, ctx)}
                </blockElements.orderedList>
            );

        case "bsky-post":
            return <blockElements.bskyPost key={key} uri={block.uri} cid={block.cid} />;

        case "horizontal-rule":
            return <blockElements.horizontalRule key={key} />;

        case "website":
            return (
                <blockElements.website key={key} uri={block.uri}>
                    {block.title}
                </blockElements.website>
            );

        case "table": {
            const [headerRow, ...bodyRows] = block.rows;
            return (
                <blockElements.table key={key}>
                    {headerRow && (
                        <blockElements.tableHead>
                            {renderTableRows([headerRow], `${key}-h`, ctx, true)}
                        </blockElements.tableHead>
                    )}
                    {bodyRows.length > 0 && (
                        <blockElements.tableBody>{renderTableRows(bodyRows, `${key}-b`, ctx)}</blockElements.tableBody>
                    )}
                </blockElements.table>
            );
        }

        case "iframe":
            return <blockElements.iframe key={key} url={block.url} />;

        case "math":
            return <blockElements.math key={key} content={block.content} />;

        default:
            return <blockElements.unknown key={key} block={block} />;
    }
};

export const astToJsx = (ast: AstDocument, context: RenderContext) => {
    const { authorDid = "", inlineElements, blockElements, slugGenerator = createSlugGenerator() } = context;
    const fullContext: RenderContextInternal = {
        authorDid,
        headings: [],
        slugGenerator,
        inlineElements: { ...InlineElements, ...inlineElements },
        blockElements: { ...BlockElements, ...blockElements },
    };

    const jsx = ast.map((block, i) => renderBlock(block, `block-${i.toString()}`, fullContext));

    return { jsx, headings: fullContext.headings };
};
