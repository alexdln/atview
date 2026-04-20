import { type PcktBlock, type StandardDocumentPckt } from "../../defs/document";
import * as site from "../../../lexicons/site";

export interface BuildParams {
    items: PcktBlock[];
}

export interface Metadata {
    siteUri: string;
    path?: string;
    title: string;
    description: string;
    tags: string[];
    publishedAt: string;
    coverImage?: unknown;
}

const plainFromBlock = (block: PcktBlock): string => {
    switch (block.$type) {
        case "blog.pckt.block.text":
        case "blog.pckt.block.heading":
            return block.plaintext;
        case "blog.pckt.block.blockquote":
            return block.content.map(plainFromBlock).filter(Boolean).join("\n");
        case "blog.pckt.block.orderedList":
        case "blog.pckt.block.bulletList":
        case "blog.pckt.block.taskList":
            return (block.content ?? [])
                .flatMap((item) => item.content.map(plainFromBlock))
                .filter(Boolean)
                .join("\n");
        case "blog.pckt.block.table":
            return (block.content ?? [])
                .flatMap((row) => row.content.flatMap((cell) => cell.content.map(plainFromBlock)))
                .filter(Boolean)
                .join("\n");
        default:
            return "";
    }
};

const extractPlainText = (items: PcktBlock[]) => items.map(plainFromBlock).filter(Boolean).join("\n\n");

export const formatDocument = (data: BuildParams, metadata: Metadata): StandardDocumentPckt =>
    ({
        $type: site.standard.document.$type,
        site: metadata.siteUri,
        path: metadata.path,
        title: metadata.title,
        description: metadata.description,
        textContent: extractPlainText(data.items),
        tags: metadata.tags,
        publishedAt: metadata.publishedAt,
        ...(metadata.coverImage ? { coverImage: metadata.coverImage } : {}),
        content: {
            $type: "blog.pckt.content",
            items: data.items,
        },
    }) as StandardDocumentPckt;
