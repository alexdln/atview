import {
    type OffprintBlock,
    type OffprintListItem,
    type OffprintTaskItem,
    type StandardDocumentOffprint,
} from "../../defs/document";
import * as site from "../../../lexicons/site";

export interface BuildParams {
    items: OffprintBlock[];
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

const plainFromListItems = (items: (OffprintListItem | OffprintTaskItem)[]): string =>
    items
        .flatMap((item) => [item.content.plaintext, ...(item.children ? [plainFromListItems(item.children)] : [])])
        .filter(Boolean)
        .join("\n");

const plainFromBlock = (block: OffprintBlock): string => {
    switch (block.$type) {
        case "app.offprint.block.text":
        case "app.offprint.block.heading":
        case "app.offprint.block.callout":
            return block.plaintext;
        case "app.offprint.block.blockquote":
            return block.content.map(plainFromBlock).filter(Boolean).join("\n");
        case "app.offprint.block.bulletList":
        case "app.offprint.block.orderedList":
        case "app.offprint.block.taskList":
            return plainFromListItems(block.children);
        case "app.offprint.block.codeBlock":
            return block.code;
        case "app.offprint.block.button":
            return block.text;
        default:
            return "";
    }
};

const extractPlainText = (items: OffprintBlock[]) => items.map(plainFromBlock).filter(Boolean).join("\n\n");

export const formatDocument = (data: BuildParams, metadata: Metadata): StandardDocumentOffprint =>
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
            $type: "app.offprint.content",
            items: data.items,
        },
    }) as StandardDocumentOffprint;
