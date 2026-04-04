import { type Agent } from "@atproto/api";

import { type Facet } from "@src/core/defs/document";

export const processBlobs = async (facets: Facet[], objectStore: Map<string, File>, agent: Agent): Promise<Facet[]> => {
    const result: Facet[] = [];

    for (const facet of facets) {
        const features = [];
        for (const feature of facet.features) {
            const { text, altText, caption, image, $type } = feature;

            if (typeof image !== "string") continue;

            const file = objectStore.get(image);

            if (!file) continue;

            const bytes = new Uint8Array(await file.arrayBuffer());
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
