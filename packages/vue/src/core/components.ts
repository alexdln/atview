import { h, type FunctionalComponent, type VNodeChild, type Component } from "vue";

import { type Blob, formatMediaUri } from "@atview/core";

import {
    type DefaultBskyPostProps,
    type DefaultCodeBlockProps,
    type DefaultHeadingProps,
    type DefaultIframeProps,
    type DefaultInlineWrapProps,
    type DefaultLinkProps,
    type DefaultMathProps,
    type DefaultMediaProps,
    type DefaultMentionProps,
    type DefaultTaskListItemProps,
    type DefaultUnknownBlockProps,
    type DefaultWebsiteProps,
    type MediaUriLoader,
    type OlProps,
    type TdProps,
    type ThProps,
} from "./types";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const slotChildren = (children?: VNodeChild) => (!children ? undefined : [children]);

const mediaImageSrc = (image: string | Blob, authorDid?: string, loader?: MediaUriLoader) => {
    if (typeof image === "string") return image;
    if (loader) return loader({ authorDid, format: "png", image, size: "fullsize" });
    return formatMediaUri(image, { authorDid });
};

export const Mention: FunctionalComponent<DefaultMentionProps> = (props, { slots }) =>
    h("span", { "data-did": props.did }, slotChildren(slots.default?.()));

export const Heading: FunctionalComponent<DefaultHeadingProps> = (props, { slots }) => {
    const tag = HEADING_TAGS[props.level - 1];
    return h(tag, { id: props.id }, slotChildren(slots.default?.()));
};

export const CodeBlock: FunctionalComponent<DefaultCodeBlockProps> = ({ text }) =>
    h("pre", undefined, [h("code", undefined, text)]);

export const Media: FunctionalComponent<DefaultMediaProps> = ({
    alt,
    caption,
    image,
    width,
    height,
    title,
    authorDid,
    loader,
}) => {
    const src = mediaImageSrc(image, authorDid, loader);
    return h("figure", undefined, [
        h("img", { src, alt: alt || "", width, height, title }),
        caption ? h("figcaption", undefined, caption) : null,
    ]);
};

export const TaskListItem: FunctionalComponent<DefaultTaskListItemProps> = (props, { slots }) =>
    h("li", undefined, [
        h("label", undefined, [
            h("input", { type: "checkbox", disabled: true, checked: props.checked }),
            h("span", undefined, slotChildren(slots.default?.())),
        ]),
    ]);

export const BskyPost: FunctionalComponent<DefaultBskyPostProps> = ({ uri, cid }) =>
    h("p", { "data-uri": uri, "data-cid": cid }, [h("a", { href: uri }, uri)]);

export const Website: FunctionalComponent<DefaultWebsiteProps> = (props, { slots }) =>
    h("p", undefined, [h("a", { href: props.uri }, slots.default?.() ?? props.uri)]);

export const Iframe: FunctionalComponent<DefaultIframeProps> = ({ url, height }) =>
    h("iframe", {
        src: url,
        height,
        sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
        referrerPolicy: "strict-origin-when-cross-origin",
        loading: "lazy",
    });

export const MathBlock: FunctionalComponent<DefaultMathProps> = ({ content }) =>
    h("div", { role: "math" }, [h("pre", undefined, [h("code", undefined, content)])]);

export const UnknownBlock: FunctionalComponent<DefaultUnknownBlockProps> = ({ block }) =>
    h("p", undefined, [h("strong", undefined, "Unsupported block"), h("code", undefined, ` ${String(block.type)}`)]);

export const InlineElements = {
    bold: "strong" as string | Component<DefaultInlineWrapProps>,
    italic: "em" as string | Component<DefaultInlineWrapProps>,
    underline: "u" as string | Component<DefaultInlineWrapProps>,
    inlineCode: "code" as string | Component<DefaultInlineWrapProps>,
    strikethrough: "s" as string | Component<DefaultInlineWrapProps>,
    highlight: "mark" as string | Component<DefaultInlineWrapProps>,
    link: "a" as string | Component<DefaultLinkProps>,
    mention: Mention,
};

export const BlockElements = {
    paragraph: "p" as string | Component<DefaultInlineWrapProps>,
    heading: Heading,
    blockquote: "blockquote" as string | Component<DefaultInlineWrapProps>,
    codeBlock: CodeBlock,
    media: Media,
    unorderedList: "ul" as string | Component<DefaultInlineWrapProps>,
    orderedList: "ol" as string | Component<OlProps>,
    listItem: "li" as string | Component<DefaultInlineWrapProps>,
    taskList: "ul" as string | Component<DefaultInlineWrapProps>,
    taskListItem: TaskListItem,
    bskyPost: BskyPost,
    horizontalRule: "hr" as string | Component,
    website: Website,
    iframe: Iframe,
    table: "table" as string | Component<DefaultInlineWrapProps>,
    tableBody: "tbody" as string | Component<DefaultInlineWrapProps>,
    tableHead: "thead" as string | Component<DefaultInlineWrapProps>,
    tableRow: "tr" as string | Component<DefaultInlineWrapProps>,
    tableCell: "td" as string | Component<TdProps>,
    tableHeadCell: "th" as string | Component<ThProps>,
    unknown: UnknownBlock,
    math: MathBlock,
    hardBreak: "br" as string | Component,
};
