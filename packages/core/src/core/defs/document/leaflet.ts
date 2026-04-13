import { type Blob, type Facet } from "./shared";

export interface LeafletTextBlock {
    $type: "pub.leaflet.blocks.text";
    plaintext: string;
    facets?: Facet[];
    textSize?: "default" | "small" | "large";
}

export interface LeafletHeaderBlock {
    $type: "pub.leaflet.blocks.header";
    plaintext: string;
    facets?: Facet[];
    level?: number;
}

export interface LeafletBlockquoteBlock {
    $type: "pub.leaflet.blocks.blockquote";
    plaintext: string;
    facets?: Facet[];
}

export interface LeafletCodeBlock {
    $type: "pub.leaflet.blocks.code";
    plaintext: string;
    language?: string;
}

export interface LeafletImageBlock {
    $type: "pub.leaflet.blocks.image";
    image: Blob | string;
    aspectRatio: { width: number; height: number };
    alt?: string;
    caption?: string;
}

export interface LeafletListItem {
    content: LeafletTextBlock | LeafletHeaderBlock | LeafletImageBlock;
    children?: LeafletListItem[];
}

export interface LeafletUnorderedListBlock {
    $type: "pub.leaflet.blocks.unorderedList";
    children: LeafletListItem[];
}

export interface LeafletOrderedListBlock {
    $type: "pub.leaflet.blocks.orderedList";
    children: LeafletListItem[];
    startIndex?: number;
}

export interface LeafletBskyPostBlock {
    $type: "pub.leaflet.blocks.bskyPost";
    postRef: { uri: string; cid: string };
}

export interface LeafletHorizontalRuleBlock {
    $type: "pub.leaflet.blocks.horizontalRule";
}

export interface LeafletWebsiteBlock {
    $type: "pub.leaflet.blocks.website";
    src: string;
    title?: string;
    description?: string;
}

export interface LeafletIframeBlock {
    $type: "pub.leaflet.blocks.iframe";
    url: string;
    height?: number;
}

export interface LeafletMathBlock {
    $type: "pub.leaflet.blocks.math";
    tex: string;
}

export type LeafletBlock =
    | LeafletTextBlock
    | LeafletHeaderBlock
    | LeafletBlockquoteBlock
    | LeafletCodeBlock
    | LeafletImageBlock
    | LeafletUnorderedListBlock
    | LeafletOrderedListBlock
    | LeafletBskyPostBlock
    | LeafletHorizontalRuleBlock
    | LeafletWebsiteBlock
    | LeafletIframeBlock
    | LeafletMathBlock;

export interface LeafletDocumentBlock {
    $type: "pub.leaflet.pages.linearDocument#block";
    block: LeafletBlock;
    alignment?: string;
}

export interface LeafletLinearDocument {
    $type: "pub.leaflet.pages.linearDocument";
    id?: string;
    blocks: LeafletDocumentBlock[];
}

export type LeafletDocument = {
    $type: "pub.leaflet.document";
    title: string;
    author: string;
    pages: LeafletLinearDocument[];
    tags?: string[];
    description?: string;
    publishedAt?: string;
    publication?: string;
    coverImage?: Blob | string;
    postRef?: { uri: string; cid: string };
    // not standard field
    path?: string;
};
