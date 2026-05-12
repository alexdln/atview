import { type VNodeChild, type ComponentPublicInstance } from "vue";
import { type AstBlockNode, type AstBskyPostNode, type AstHeadingNode, type Blob } from "@atview/core";

export type MediaUriLoader = (context: { authorDid?: string; format: string; image: Blob; size: string }) => string;

export interface DefaultInlineWrapProps {
    children?: VNodeChild;
}

export interface DefaultLinkProps {
    href?: string;
    children?: VNodeChild;
}

export interface DefaultMentionProps {
    did: string;
    children?: VNodeChild;
}

export interface DefaultHeadingProps {
    level: AstHeadingNode["level"];
    id: string;
    children?: VNodeChild;
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

export interface DefaultTaskListItemProps {
    checked: boolean;
    children?: VNodeChild;
}

export type DefaultBskyPostProps = Pick<AstBskyPostNode, "uri" | "cid">;

export interface DefaultWebsiteProps {
    uri: string;
    children?: VNodeChild;
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

export interface OlProps extends DefaultInlineWrapProps {
    start?: number;
}

export interface TdProps extends DefaultInlineWrapProps {
    colSpan?: number;
    rowSpan?: number;
}

export interface ThProps extends DefaultInlineWrapProps {
    colSpan?: number;
    rowSpan?: number;
}

export type ElementOrComponent<P = Record<string, unknown>> =
    | string
    | ComponentPublicInstance
    | ((props: P) => unknown);
