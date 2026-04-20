import { type l } from "@atproto/lex";

import * as RichtextFacet from "../../../lexicons/net/atview/richtext/facet";
import { type Blob } from "./shared";

export type AtviewAspectRatio = RichtextFacet.AspectRatio;

export type AtviewBoldFeature = l.$Typed<RichtextFacet.B, "net.atview.richtext.facet#b">;
export type AtviewItalicFeature = l.$Typed<RichtextFacet.I, "net.atview.richtext.facet#i">;
export type AtviewUnderlineFeature = l.$Typed<RichtextFacet.U, "net.atview.richtext.facet#u">;
export type AtviewInlineCodeFeature = l.$Typed<RichtextFacet.Code, "net.atview.richtext.facet#code">;
export type AtviewStrikethroughFeature = l.$Typed<
    RichtextFacet.Strikethrough,
    "net.atview.richtext.facet#strikethrough"
>;
export type AtviewHighlightFeature = l.$Typed<RichtextFacet.Highlight, "net.atview.richtext.facet#highlight">;

export type AtviewLinkFeature = l.$Typed<Omit<RichtextFacet.Link, "uri">, "net.atview.richtext.facet#link"> & {
    uri: string;
};
export type AtviewMentionFeature = l.$Typed<Omit<RichtextFacet.Mention, "did">, "net.atview.richtext.facet#mention"> & {
    did: string;
};

export type AtviewHeadingFeature =
    | l.$Typed<RichtextFacet.H2, "net.atview.richtext.facet#h2">
    | l.$Typed<RichtextFacet.H3, "net.atview.richtext.facet#h3">
    | l.$Typed<RichtextFacet.H4, "net.atview.richtext.facet#h4">
    | l.$Typed<RichtextFacet.H5, "net.atview.richtext.facet#h5">
    | l.$Typed<RichtextFacet.H6, "net.atview.richtext.facet#h6">;

export type AtviewBlockquoteFeature = l.$Typed<RichtextFacet.Blockquote, "net.atview.richtext.facet#blockquote">;
export type AtviewCodeBlockFeature = l.$Typed<RichtextFacet.CodeBlock, "net.atview.richtext.facet#codeBlock">;

export type AtviewMediaFeature = l.$Typed<Omit<RichtextFacet.Media, "image">, "net.atview.richtext.facet#media"> & {
    image: Blob | string;
};

export type AtviewBskyPostFeature = l.$Typed<
    Omit<RichtextFacet.BskyPost, "uri" | "cid">,
    "net.atview.richtext.facet#bskyPost"
> & { uri: string; cid?: string };

export type AtviewUnorderedListFeature = l.$Typed<RichtextFacet.Ul, "net.atview.richtext.facet#ul">;
export type AtviewOrderedListFeature = l.$Typed<RichtextFacet.Ol, "net.atview.richtext.facet#ol">;

export type AtviewWebsiteFeature = l.$Typed<Omit<RichtextFacet.Website, "uri">, "net.atview.richtext.facet#website"> & {
    uri: string;
};

export type AtviewHorizontalRuleFeature = l.$Typed<
    RichtextFacet.HorizontalRule,
    "net.atview.richtext.facet#horizontalRule"
>;
export type AtviewIframeFeature = l.$Typed<Omit<RichtextFacet.Iframe, "url">, "net.atview.richtext.facet#iframe"> & {
    url: string;
};
export type AtviewMathFeature = l.$Typed<RichtextFacet.Math, "net.atview.richtext.facet#math">;
export type AtviewHardBreakFeature = l.$Typed<RichtextFacet.HardBreak, "net.atview.richtext.facet#hardBreak">;

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

export type AtviewByteSlice = RichtextFacet.ByteSlice;

export interface AtviewFacet {
    index: { byteStart: number; byteEnd: number };
    features: AtviewFeature[];
}
