import { type Blob } from "./shared";

export interface AtviewAspectRatio {
    width: number;
    height: number;
}

export interface AtviewBoldFeature {
    $type: "net.atview.richtext.facet#b";
}

export interface AtviewItalicFeature {
    $type: "net.atview.richtext.facet#i";
}

export interface AtviewUnderlineFeature {
    $type: "net.atview.richtext.facet#u";
}

export interface AtviewInlineCodeFeature {
    $type: "net.atview.richtext.facet#code";
}

export interface AtviewStrikethroughFeature {
    $type: "net.atview.richtext.facet#strikethrough";
}

export interface AtviewHighlightFeature {
    $type: "net.atview.richtext.facet#highlight";
}

export interface AtviewLinkFeature {
    $type: "net.atview.richtext.facet#link";
    uri: string;
}

export interface AtviewMentionFeature {
    $type: "net.atview.richtext.facet#mention";
    did: string;
}

export interface AtviewHeadingFeature {
    $type:
        | "net.atview.richtext.facet#h2"
        | "net.atview.richtext.facet#h3"
        | "net.atview.richtext.facet#h4"
        | "net.atview.richtext.facet#h5"
        | "net.atview.richtext.facet#h6";
}

export interface AtviewBlockquoteFeature {
    $type: "net.atview.richtext.facet#blockquote";
}

export interface AtviewCodeBlockFeature {
    $type: "net.atview.richtext.facet#code-block";
    language?: string;
}

export interface AtviewMediaFeature {
    $type: "net.atview.richtext.facet#media";
    image: Blob | string;
    aspectRatio?: AtviewAspectRatio;
    altText?: string;
    caption?: string;
    title?: string;
}

export interface AtviewBskyPostFeature {
    $type: "net.atview.richtext.facet#bsky-post";
    uri: string;
    cid?: string;
}

export interface AtviewUnorderedListFeature {
    $type: "net.atview.richtext.facet#ul";
}

export interface AtviewOrderedListFeature {
    $type: "net.atview.richtext.facet#ol";
}

export interface AtviewWebsiteFeature {
    $type: "net.atview.richtext.facet#website";
    uri: string;
    title?: string;
}

export interface AtviewHorizontalRuleFeature {
    $type: "net.atview.richtext.facet#horizontal-rule";
}

export interface AtviewIframeFeature {
    $type: "net.atview.richtext.facet#iframe";
    url: string;
    height?: number;
}

export interface AtviewMathFeature {
    $type: "net.atview.richtext.facet#math";
    tex: string;
}

export interface AtviewHardBreakFeature {
    $type: "net.atview.richtext.facet#hard-break";
}

export type AtviewInlineFeature =
    | AtviewBoldFeature
    | AtviewItalicFeature
    | AtviewUnderlineFeature
    | AtviewInlineCodeFeature
    | AtviewStrikethroughFeature
    | AtviewHighlightFeature
    | AtviewLinkFeature
    | AtviewMentionFeature;

export type AtviewBlockFeature =
    | AtviewHeadingFeature
    | AtviewBlockquoteFeature
    | AtviewCodeBlockFeature
    | AtviewMediaFeature
    | AtviewBskyPostFeature
    | AtviewUnorderedListFeature
    | AtviewOrderedListFeature
    | AtviewWebsiteFeature
    | AtviewHorizontalRuleFeature
    | AtviewIframeFeature
    | AtviewMathFeature
    | AtviewHardBreakFeature;

export type AtviewFeature = AtviewInlineFeature | AtviewBlockFeature;

export interface AtviewFacet {
    index: {
        byteStart: number;
        byteEnd: number;
    };
    features: AtviewFeature[];
}
