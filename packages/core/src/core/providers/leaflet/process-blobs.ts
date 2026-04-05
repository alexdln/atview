import { type Agent } from "@atproto/api";

import { type LeafletLinearDocument } from "@src/core/defs/document";
import { readBlobAsUint8Array } from "@src/core/utils/blob";

export const processBlobs = async (
    pages: LeafletLinearDocument[],
    objectStore: Map<string, File>,
    agent: Agent,
): Promise<LeafletLinearDocument[]> => {
    const result = structuredClone(pages);

    for (const page of result) {
        for (const entry of page.blocks) {
            const block = entry.block;

            if (block.$type !== "pub.leaflet.blocks.image" || typeof block.image !== "string") continue;

            const file = objectStore.get(block.image);

            if (!file) continue;

            const bytes = await readBlobAsUint8Array(file);
            const { data } = await agent.com.atproto.repo.uploadBlob(bytes, { encoding: file.type });
            const { mimeType, ref, size } = data.blob;
            block.image = { mimeType, ref, size, $type: "blob" };
        }
    }

    return result;
};
