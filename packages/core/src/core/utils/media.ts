import { CID, type MultihashDigest, type Version } from "multiformats/cid";

import { type Blob } from "@src/core/defs/document";

export const formatLinkKey = (
    link:
        | string
        | { $link: string }
        | {
              code: number;
              version: number;
              multihash: MultihashDigest<number>;
          }
        | undefined,
) => {
    if (!link) return "";

    if (typeof link === "string") return link;

    if ("version" in link && "code" in link && "multihash" in link) {
        const cid = CID.create(link.version as Version, link.code, link.multihash);
        return cid.toString();
    }

    if (link.toString() === "[object Object]") return "$link" in link ? link.$link : "";

    return link.toString();
};

export function formatMediaUri(image: Blob | string, authorDid?: string): string;
export function formatMediaUri(image?: undefined, authorDid?: string): undefined;
export function formatMediaUri(image?: Blob | string, authorDid?: string): string | undefined;
export function formatMediaUri(image?: Blob | string, authorDid?: string) {
    const uri =
        !image || typeof image === "string"
            ? image
            : `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorDid}/${formatLinkKey(image.ref)}`;
    return uri;
}
