import { type AppBskyRichtextFacet } from "@atproto/api";

export const bytePositionToCharPosition = (raw: string, bytePosition: number) => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const charPosition = textDecoder.decode(textEncoder.encode(raw).slice(0, bytePosition)).length;

    return charPosition;
};

export const charPositionToBytePosition = (raw: string, charPosition: number) => {
    const textEncoder = new TextEncoder();
    const bytePosition = textEncoder.encode(raw.slice(0, charPosition)).length;

    return bytePosition;
};

export const isRelativeLink = (link: string) => {
    return link.startsWith("/") && !link.startsWith("//");
};

export const getFacetLink = (feature: AppBskyRichtextFacet.Main["features"][0]) => {
    if ("uri" in feature) {
        return isRelativeLink(feature.uri) ? `https://bsky.app${feature.uri}` : feature.uri;
    }
    if ("did" in feature) {
        return `https://bsky.app/profile/${feature.did}`;
    }
    if ("tag" in feature) {
        return `https://bsky.app/hashtag/${feature.tag}`;
    }
    return "";
};
