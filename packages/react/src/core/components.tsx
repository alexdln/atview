import React from "react";

import { type Blob } from "@atview/core";
import { formatMediaUri } from "@atview/core";

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

const mediaImageSrc = (image: string | Blob, authorDid?: string, loader?: MediaUriLoader) => {
    if (typeof image === "string") return image;
    if (loader) return loader({ authorDid, format: "png", image, size: "fullsize" });
    return formatMediaUri(image, { authorDid });
};

export const Mention: React.FC<DefaultMentionProps> = ({ did, children }) => <span data-did={did}>{children}</span>;

export const Heading: React.FC<DefaultHeadingProps> = ({ level, id, children }) => {
    const Tag = HEADING_TAGS[level - 1];
    return <Tag id={id}>{children}</Tag>;
};

export const CodeBlock: React.FC<DefaultCodeBlockProps> = ({ text }) => (
    <pre>
        <code>{text}</code>
    </pre>
);

export const Media: React.FC<DefaultMediaProps> = ({
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
    return (
        <figure>
            <img src={src} alt={alt || ""} width={width} height={height} title={title} />
            {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
    );
};

export const TaskListItem: React.FC<DefaultTaskListItemProps> = ({ checked, children }) => (
    <li>
        <label>
            <input type="checkbox" disabled checked={checked} />
            <span>{children}</span>
        </label>
    </li>
);

export const BskyPost: React.FC<DefaultBskyPostProps> = ({ uri, cid }) => (
    <p data-uri={uri} data-cid={cid}>
        <a href={uri}>{uri}</a>
    </p>
);

export const Website: React.FC<DefaultWebsiteProps> = ({ uri, children }) => (
    <p>
        <a href={uri}>{children || uri}</a>
    </p>
);

export const Iframe: React.FC<DefaultIframeProps> = ({ url, height }) => (
    <iframe
        src={url}
        height={height}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
    />
);

export const MathBlock: React.FC<DefaultMathProps> = ({ content }) => (
    <div role="math">
        <pre>
            <code>{content}</code>
        </pre>
    </div>
);

export const UnknownBlock: React.FC<DefaultUnknownBlockProps> = ({ block }) => (
    <p>
        <strong>Unsupported block</strong>
        <code> {String(block.type)}</code>
    </p>
);

export const InlineElements = {
    bold: "strong" as React.ElementType<DefaultInlineWrapProps>,
    italic: "em" as React.ElementType<DefaultInlineWrapProps>,
    underline: "u" as React.ElementType<DefaultInlineWrapProps>,
    inlineCode: "code" as React.ElementType<DefaultInlineWrapProps>,
    strikethrough: "s" as React.ElementType<DefaultInlineWrapProps>,
    highlight: "mark" as React.ElementType<DefaultInlineWrapProps>,
    link: "a" as React.ElementType<DefaultLinkProps>,
    mention: Mention,
};

export const BlockElements = {
    paragraph: "p" as React.ElementType<DefaultInlineWrapProps>,
    heading: Heading,
    blockquote: "blockquote" as React.ElementType<DefaultInlineWrapProps>,
    codeBlock: CodeBlock,
    media: Media,
    unorderedList: "ul" as React.ElementType<DefaultInlineWrapProps>,
    orderedList: "ol" as React.ElementType<OlProps>,
    listItem: "li" as React.ElementType<DefaultInlineWrapProps>,
    taskList: "ul" as React.ElementType<DefaultInlineWrapProps>,
    taskListItem: TaskListItem,
    bskyPost: BskyPost,
    horizontalRule: "hr" as React.ElementType,
    website: Website,
    iframe: Iframe,
    table: "table" as React.ElementType<DefaultInlineWrapProps>,
    tableBody: "tbody" as React.ElementType<DefaultInlineWrapProps>,
    tableHead: "thead" as React.ElementType<DefaultInlineWrapProps>,
    tableRow: "tr" as React.ElementType<DefaultInlineWrapProps>,
    tableCell: "td" as React.ElementType<TdProps>,
    tableHeadCell: "th" as React.ElementType<ThProps>,
    unknown: UnknownBlock,
    math: MathBlock,
    hardBreak: "br" as React.ElementType,
};
