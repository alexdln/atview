import { type ComponentProps, type PropsWithChildren } from "react";

import { type AstBlockNode, type AstBskyPostNode, type AstHeadingNode, type Blob } from "@atview/core";

export type MediaUriLoader = (context: { authorDid?: string; format: string; image: Blob; size: string }) => string;

export type DefaultInlineWrapProps = PropsWithChildren;

export type DefaultLinkProps = PropsWithChildren<Pick<ComponentProps<"a">, "href">>;

export interface DefaultMentionProps extends PropsWithChildren {
    did: string;
}

export interface DefaultHeadingProps extends PropsWithChildren {
    level: AstHeadingNode["level"];
    id: string;
}

export interface DefaultCodeBlockProps {
    text: string;
    language?: string;
}

export interface DefaultMediaProps {
    alt?: string;
    caption?: string;
    image: string | Blob;
    width?: number;
    height?: number;
    title?: string;
    authorDid?: string;
    loader?: MediaUriLoader;
}

export interface DefaultTaskListItemProps extends PropsWithChildren {
    checked: boolean;
}

export type DefaultBskyPostProps = Pick<AstBskyPostNode, "uri" | "cid">;

export interface DefaultWebsiteProps extends PropsWithChildren {
    uri: string;
}

export interface DefaultIframeProps {
    url: string;
    height?: number;
}

export interface DefaultMathProps {
    content: string;
}

export interface DefaultUnknownBlockProps {
    block: AstBlockNode;
}

export type OlProps = DefaultInlineWrapProps & Pick<ComponentProps<"ol">, "start">;

export type TdProps = DefaultInlineWrapProps & Pick<ComponentProps<"td">, "colSpan" | "rowSpan">;

export type ThProps = DefaultInlineWrapProps & Pick<ComponentProps<"th">, "colSpan" | "rowSpan">;
