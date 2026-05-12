import { h, type Component, type VNodeChild } from "vue";

import { createSlugGenerator } from "./slugify";

import {
    type AstBlockNode,
    type AstDocument,
    type AstInlineNode,
    type AstListItem,
    type AstTableRow,
    type AstTaskListItem,
    type MediaUriLoader,
} from "@atview/core";
import { type InlineElements, type BlockElements } from "./components";

export interface RenderContext {
    imageLoader?: MediaUriLoader;
    authorDid: string;
    inlineElements: typeof InlineElements;
    blockElements: typeof BlockElements;
    slugGenerator?: (text: string) => string;
}

export type Headings = { id: string; text: string; nested: boolean }[];

export interface RenderContextInternal extends Omit<Required<RenderContext>, "imageLoader"> {
    imageLoader?: MediaUriLoader;
    inlineElements: typeof InlineElements;
    blockElements: typeof BlockElements;
    headings: Headings;
}

const renderWithChildren = (
    element: string | Component,
    key: string,
    props: Record<string, unknown>,
    children: VNodeChild[],
) => h(element, { key, ...props }, children);

const renderWithoutChildren = (element: string | Component, key: string, props: Record<string, unknown> = {}) =>
    h(element, { key, ...props });

const renderInline = (node: AstInlineNode, key: string, ctx: RenderContextInternal): VNodeChild => {
    if (node.type === "text") {
        return node.value;
    }

    const children = node.children.map((child, i) => renderInline(child, `${key}-${i.toString()}`, ctx));

    const { inlineElements } = ctx;
    switch (node.type) {
        case "bold":
            return renderWithChildren(inlineElements.bold, key, {}, children);
        case "italic":
            return renderWithChildren(inlineElements.italic, key, {}, children);
        case "underline":
            return renderWithChildren(inlineElements.underline, key, {}, children);
        case "inline-code":
            return renderWithChildren(inlineElements.inlineCode, key, {}, children);
        case "strikethrough":
            return renderWithChildren(inlineElements.strikethrough, key, {}, children);
        case "highlight":
            return renderWithChildren(inlineElements.highlight, key, {}, children);
        case "link":
            return renderWithChildren(inlineElements.link, key, { href: node.uri }, children);
        case "mention":
            return renderWithChildren(inlineElements.mention, key, { did: node.did }, children);
    }
};

const renderInlineList = (nodes: AstInlineNode[], keyPrefix: string, ctx: RenderContextInternal): VNodeChild[] =>
    nodes.map((node, i) => renderInline(node, `${keyPrefix}-${i.toString()}`, ctx));

const inlinePlainText = (nodes: AstInlineNode[]): string =>
    nodes
        .map((node) => {
            if (node.type === "text") {
                return node.value;
            }
            return inlinePlainText(node.children);
        })
        .join("");

const renderListItems = (items: AstListItem[], keyPrefix: string, ctx: RenderContextInternal): VNodeChild[] =>
    items.map((item, i) => {
        const itemKey = `${keyPrefix}-${i.toString()}`;
        const content = renderInlineList(item.children, itemKey, ctx);
        const nested = item.sublist ? renderBlock(item.sublist, itemKey, ctx) : null;
        return renderWithChildren(ctx.blockElements.listItem, itemKey, {}, [...content, nested]);
    });

const renderTaskListItems = (items: AstTaskListItem[], keyPrefix: string, ctx: RenderContextInternal): VNodeChild[] =>
    items.map((item, i) => {
        const itemKey = `${keyPrefix}-${i.toString()}`;
        const content = renderInlineList(item.children, itemKey, ctx);
        return renderWithChildren(ctx.blockElements.taskListItem, itemKey, { checked: item.checked }, content);
    });

const renderTableRows = (
    rows: AstTableRow[],
    keyPrefix: string,
    ctx: RenderContextInternal,
    isHeader?: boolean,
): VNodeChild[] =>
    rows.map((row, index) => {
        const rowKey = `${keyPrefix}-r${index.toString()}`;
        return renderWithChildren(
            ctx.blockElements.tableRow,
            rowKey,
            {},
            row.cells.map((cell, cellIndex) => {
                const cellKey = `${rowKey}-c${cellIndex.toString()}`;
                const tag = isHeader ? ctx.blockElements.tableHeadCell : ctx.blockElements.tableCell;
                return renderWithChildren(
                    tag,
                    cellKey,
                    { colSpan: cell.colspan, rowSpan: cell.rowspan },
                    renderInlineList(cell.content, cellKey, ctx),
                );
            }),
        );
    });

const renderBlock = (block: AstBlockNode, key: string, ctx: RenderContextInternal): VNodeChild => {
    const { blockElements } = ctx;
    switch (block.type) {
        case "paragraph":
            return renderWithChildren(blockElements.paragraph, key, {}, renderInlineList(block.children, key, ctx));

        case "heading": {
            const text = inlinePlainText(block.children);
            const slug = ctx.slugGenerator(text);
            ctx.headings.push({ id: slug, text, nested: block.level > 2 });

            return renderWithChildren(
                blockElements.heading,
                slug,
                { level: block.level, id: slug },
                renderInlineList(block.children, key, ctx),
            );
        }

        case "blockquote":
            return renderWithChildren(blockElements.blockquote, key, {}, renderInlineList(block.children, key, ctx));

        case "code-block":
            return renderWithoutChildren(blockElements.codeBlock, key, { text: block.text, language: block.language });

        case "media":
            return renderWithoutChildren(blockElements.media, key, {
                authorDid: ctx.authorDid,
                loader: ctx.imageLoader,
                alt: block.alt,
                image: block.image,
                width: block.width,
                height: block.height,
                title: block.title,
                caption: block.caption,
            });

        case "unordered-list":
            return renderWithChildren(blockElements.unorderedList, key, {}, renderListItems(block.items, key, ctx));

        case "ordered-list":
            return renderWithChildren(
                blockElements.orderedList,
                key,
                { start: block.start },
                renderListItems(block.items, key, ctx),
            );

        case "task-list":
            return renderWithChildren(blockElements.taskList, key, {}, renderTaskListItems(block.items, key, ctx));

        case "bsky-post":
            return renderWithoutChildren(blockElements.bskyPost, key, { uri: block.uri, cid: block.cid });

        case "horizontal-rule":
            return renderWithoutChildren(blockElements.horizontalRule, key);

        case "website":
            return renderWithChildren(blockElements.website, key, { uri: block.uri }, [block.title]);

        case "table": {
            const [headerRow, ...bodyRows] = block.rows;
            return renderWithChildren(blockElements.table, key, {}, [
                headerRow
                    ? renderWithChildren(
                          blockElements.tableHead,
                          `${key}-head`,
                          {},
                          renderTableRows([headerRow], `${key}-h`, ctx, true),
                      )
                    : null,
                bodyRows.length > 0
                    ? renderWithChildren(
                          blockElements.tableBody,
                          `${key}-body`,
                          {},
                          renderTableRows(bodyRows, `${key}-b`, ctx),
                      )
                    : null,
            ]);
        }

        case "iframe":
            return renderWithoutChildren(blockElements.iframe, key, { url: block.url });

        case "math":
            return renderWithoutChildren(blockElements.math, key, { content: block.content });

        case "hard-break":
            return renderWithoutChildren(blockElements.hardBreak, key);

        default:
            return renderWithoutChildren(blockElements.unknown, key, { block });
    }
};

export const astToVue = (ast: AstDocument, context: RenderContext) => {
    const {
        authorDid = "",
        imageLoader,
        inlineElements,
        blockElements,
        slugGenerator = createSlugGenerator(),
    } = context;
    const fullContext: RenderContextInternal = {
        authorDid,
        imageLoader,
        headings: [],
        slugGenerator,
        inlineElements,
        blockElements,
    };

    const vue = ast.map((block, i) => renderBlock(block, `block-${i.toString()}`, fullContext));

    return { vue, headings: fullContext.headings };
};
