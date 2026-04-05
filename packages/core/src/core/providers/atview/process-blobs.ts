import { type Agent } from "@atproto/api";

import { type Facet } from "@src/core/defs/document";
import { readBlobAsUint8Array } from "@src/core/utils/blob";

export const processBlobs = async (facets: Facet[], objectStore: Map<string, File>, agent: Agent): Promise<Facet[]> => {
    const result: Facet[] = [];

    for (const facet of facets) {
        const features = [];
        for (const feature of facet.features) {
            const { text, altText, caption, image, $type } = feature;

            if (typeof image !== "string") {
                if (typeof image === "object" && image && "$type" in image && image?.$type === "blob") {
                    features.push(feature);
                }
                continue;
            }

            const file = objectStore.get(image);

            if (!file) continue;

            const bytes = await readBlobAsUint8Array(file);
            const { data } = await agent.com.atproto.repo.uploadBlob(bytes, { encoding: file.type });
            const { mimeType, ref, size } = data.blob;
            features.push({
                $type,
                text,
                altText,
                caption,
                image: { $type: "blob", mimeType, ref, size },
            });
        }
        result.push({ ...facet, features });
    }

    return result;
};
