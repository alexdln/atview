import { type Blob, type Facet } from "./shared";

export type OffprintTextAlign = "left" | "center" | "right" | "justify";
export type OffprintAlignment = "left" | "center" | "right";

export interface OffprintAspectRatio {
    width: number;
    height: number;
}

export interface OffprintTextBlock {
    $type: "app.offprint.block.text";
    plaintext: string;
    facets?: Facet[];
    textAlign?: OffprintTextAlign;
}

export interface OffprintHeadingBlock {
    $type: "app.offprint.block.heading";
    plaintext: string;
    level: 1 | 2 | 3;
    facets?: Facet[];
    textAlign?: Exclude<OffprintTextAlign, "justify">;
}

export interface OffprintBlockquoteBlock {
    $type: "app.offprint.block.blockquote";
    content: (OffprintTextBlock | OffprintHeadingBlock)[];
}

export interface OffprintCalloutBlock {
    $type: "app.offprint.block.callout";
    plaintext: string;
    facets?: Facet[];
    color?: string;
    emoji?: string;
}

export interface OffprintListItem {
    content: OffprintTextBlock;
    children?: OffprintListItem[];
}

export interface OffprintBulletListBlock {
    $type: "app.offprint.block.bulletList";
    children: OffprintListItem[];
}

export interface OffprintOrderedListBlock {
    $type: "app.offprint.block.orderedList";
    children: OffprintListItem[];
    start?: number;
}

export interface OffprintTaskItem {
    checked: boolean;
    content: OffprintTextBlock;
    children?: OffprintTaskItem[];
}

export interface OffprintTaskListBlock {
    $type: "app.offprint.block.taskList";
    children: OffprintTaskItem[];
}

export interface OffprintCodeBlockBlock {
    $type: "app.offprint.block.codeBlock";
    code: string;
    language?: string;
    showLineNumbers?: boolean;
}

export interface OffprintHorizontalRuleBlock {
    $type: "app.offprint.block.horizontalRule";
}

export interface OffprintImageBlock {
    $type: "app.offprint.block.image";
    alt?: string;
    blob?: Blob | string;
    width?: string;
    caption?: string;
    alignment?: OffprintAlignment;
    aspectRatio?: OffprintAspectRatio;
    captionFacets?: Facet[];
}

export interface OffprintMathBlockBlock {
    $type: "app.offprint.block.mathBlock";
    tex: string;
}

export interface OffprintBlueskyPostBlock {
    $type: "app.offprint.block.blueskyPost";
    post: { uri: string; cid: string };
}

export interface OffprintGridImage {
    alt?: string;
    blob?: Blob | string;
    aspectRatio?: OffprintAspectRatio;
}

export interface OffprintImageGridBlock {
    $type: "app.offprint.block.imageGrid";
    images: OffprintGridImage[];
    caption?: string;
    gridRows?: 1 | 2;
    aspectRatio?: "landscape" | "portrait" | "square" | "mosaic";
}

export interface OffprintImageCarouselBlock {
    $type: "app.offprint.block.imageCarousel";
    images: OffprintGridImage[];
    caption?: string;
}

export interface OffprintImageDiffBlock {
    $type: "app.offprint.block.imageDiff";
    images: OffprintGridImage[];
    caption?: string;
    width?: string;
    alignment?: OffprintAlignment;
}

export interface OffprintWebBookmarkBlock {
    $type: "app.offprint.block.webBookmark";
    href: string;
    title: string;
    description?: string;
    preview?: Blob | string;
    siteName?: string;
}

export interface OffprintWebEmbedBlock {
    $type: "app.offprint.block.webEmbed";
    href: string;
    title?: string;
    width?: string;
    preview?: Blob | string;
    embedUrl?: string;
    siteName?: string;
    alignment?: OffprintAlignment;
    embedWidth?: number;
    description?: string;
    embedHeight?: number;
}

export interface OffprintButtonBlock {
    $type: "app.offprint.block.button";
    href: string;
    text: string;
    caption?: string;
}

export type OffprintBlock =
    | OffprintTextBlock
    | OffprintHeadingBlock
    | OffprintBlockquoteBlock
    | OffprintCalloutBlock
    | OffprintBulletListBlock
    | OffprintOrderedListBlock
    | OffprintTaskListBlock
    | OffprintCodeBlockBlock
    | OffprintHorizontalRuleBlock
    | OffprintImageBlock
    | OffprintMathBlockBlock
    | OffprintBlueskyPostBlock
    | OffprintWebBookmarkBlock
    | OffprintWebEmbedBlock
    | OffprintImageGridBlock
    | OffprintImageCarouselBlock
    | OffprintImageDiffBlock
    | OffprintButtonBlock;
