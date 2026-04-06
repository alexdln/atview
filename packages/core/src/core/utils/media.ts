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

type MediaUriContext = {
    authorDid?: string;
    format?: "jpeg" | "png" | "webp";
    thumbnail?: boolean;
};

export function formatMediaUri(image: Blob | string, context?: MediaUriContext): string;
export function formatMediaUri(image?: undefined, context?: MediaUriContext): undefined;
export function formatMediaUri(image?: Blob | string, context?: MediaUriContext): string | undefined;
export function formatMediaUri(image?: Blob | string, context?: MediaUriContext) {
    const { authorDid, format = "jpeg", thumbnail } = context ?? {};
    const uri =
        !image || typeof image === "string"
            ? image
            : `https://cdn.bsky.app/img/${thumbnail ? "feed_thumbnail" : "feed_fullsize"}/plain/${authorDid}/${formatLinkKey(image.ref)}@${format}`;
    return uri;
}
