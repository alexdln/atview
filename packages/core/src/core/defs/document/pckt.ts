import { type Facet, type Blob } from "./shared";

export interface PcktTextBlock {
    $type: "blog.pckt.block.text";
    plaintext: string;
    facets?: Facet[];
}

export interface PcktHeadingBlock {
    $type: "blog.pckt.block.heading";
    plaintext: string;
    level: number;
}

export interface PcktImageBlock {
    $type: "blog.pckt.block.image";
    blob?: Blob | string;
    alt?: string;
    attrs: {
        alt?: string;
        src: string;
        blob: Blob | string;
        align?: string;
    };
}

export interface PcktWebsiteBlock {
    $type: "blog.pckt.block.website";
    src: string;
    title?: string;
    description?: string;
    previewImage?: string;
    attrs?: { src?: string; title?: string; description?: string; previewImage?: string };
}

export interface PcktBlueskyEmbedBlock {
    $type: "blog.pckt.block.blueskyEmbed";
    postRef: { uri: string; cid: string };
    attrs?: { postRef?: { uri: string; cid: string } };
}

export interface PcktBlockquoteBlock {
    $type: "blog.pckt.block.blockquote";
    content: PcktBlock[];
}

export interface PcktCodeBlock {
    $type: "blog.pckt.block.codeBlock";
    plaintext: string;
    language?: string;
}

export interface PcktHorizontalRuleBlock {
    $type: "blog.pckt.block.horizontalRule";
}

export interface PcktListItem {
    $type: "blog.pckt.block.listItem";
    content: PcktBlock[];
}

export interface PcktOrderedListBlock {
    $type: "blog.pckt.block.orderedList";
    attrs?: { start?: number };
    content: PcktListItem[];
}

export interface PcktBulletListBlock {
    $type: "blog.pckt.block.bulletList";
    content: PcktListItem[];
}

export interface PcktTableCell {
    $type: "blog.pckt.block.tableCell";
    attrs?: { colspan?: number; rowspan?: number };
    content: PcktBlock[];
}

export interface PcktTableRow {
    $type: "blog.pckt.block.tableRow";
    content: PcktTableCell[];
}

export interface PcktTableBlock {
    $type: "blog.pckt.block.table";
    content: PcktTableRow[];
}

export interface PcktIframeBlock {
    $type: "blog.pckt.block.iframe";
    url: string;
    attrs?: { url?: string };
}

export type PcktBlock =
    | PcktTextBlock
    | PcktHeadingBlock
    | PcktImageBlock
    | PcktWebsiteBlock
    | PcktBlueskyEmbedBlock
    | PcktBlockquoteBlock
    | PcktCodeBlock
    | PcktHorizontalRuleBlock
    | PcktOrderedListBlock
    | PcktBulletListBlock
    | PcktTableBlock
    | PcktIframeBlock;
