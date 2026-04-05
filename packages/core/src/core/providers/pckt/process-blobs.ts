import { type Agent } from "@atproto/api";

import { type PcktBlock, type PcktImageBlock } from "@src/core/defs/document";
import { readBlobAsUint8Array } from "@src/core/utils/blob";

const processImageBlob = async (block: PcktImageBlock, objectStore: Map<string, File>, agent: Agent) => {
    const ref = block.blob ?? block.attrs?.blob;
    if (typeof ref !== "string") return;

    const file = objectStore.get(ref);
    if (!file) return;

    const bytes = await readBlobAsUint8Array(file);
    const { data } = await agent.com.atproto.repo.uploadBlob(bytes, { encoding: file.type });
    const { mimeType, ref: blobRef, size } = data.blob;
    const uploaded = { $type: "blob" as const, mimeType, ref: blobRef, size };
    const alt = block.alt ?? block.attrs?.alt;
    block.blob = uploaded;
    block.attrs = {
        src: block.attrs?.src ?? "",
        blob: uploaded,
        ...(alt ? { alt } : {}),
        ...(block.attrs?.align ? { align: block.attrs.align } : {}),
    };
};

const walkBlocks = async (blocks: PcktBlock[], objectStore: Map<string, File>, agent: Agent) => {
    for (const block of blocks) {
        if (block.$type === "blog.pckt.block.image") {
            await processImageBlob(block, objectStore, agent);
        } else if (block.$type === "blog.pckt.block.blockquote") {
            await walkBlocks(block.content, objectStore, agent);
        } else if (block.$type === "blog.pckt.block.orderedList" || block.$type === "blog.pckt.block.bulletList") {
            for (const item of block.content ?? []) await walkBlocks(item.content, objectStore, agent);
        } else if (block.$type === "blog.pckt.block.table") {
            for (const row of block.content ?? []) {
                for (const cell of row.content) await walkBlocks(cell.content, objectStore, agent);
            }
        }
    }
};

export const processBlobs = async (
    items: PcktBlock[],
    objectStore: Map<string, File>,
    agent: Agent,
): Promise<PcktBlock[]> => {
    const result = structuredClone(items) as PcktBlock[];
    await walkBlocks(result, objectStore, agent);
    return result;
};
