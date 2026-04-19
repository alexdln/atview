import { type Blob } from "@src/core/defs/document";

export type MediaUriCollection = Record<string, Record<string, string>>;

export interface MediaUriLoaderContext {
    authorDid?: string;
    format: string;
    image: Blob;
    size: string;
}

export type MediaUriLoader = (context: MediaUriLoaderContext) => string;

export interface MediaUrisContext {
    authorDid?: string;
    formats?: string[];
    loader?: MediaUriLoader;
    sizes?: string[];
}

type MediaUriContext = {
    authorDid?: string;
    format?: string;
    loader?: MediaUriLoader;
    thumbnail?: boolean;
};

const defaultMediaUriLoader: MediaUriLoader = ({ authorDid, image, format, size }) =>
    `https://cdn.bsky.app/img/${size === "thumbnail" ? "feed_thumbnail" : "feed_fullsize"}/plain/${authorDid}/${image.ref.toString()}@${format}`;

export function formatMediaUris(image: Blob | string, context?: MediaUrisContext): MediaUriCollection;
export function formatMediaUris(image?: undefined, context?: MediaUrisContext): undefined;
export function formatMediaUris(image?: Blob | string, context?: MediaUrisContext): MediaUriCollection | undefined;
export function formatMediaUris(image?: Blob | string, context?: MediaUrisContext) {
    if (!image) return undefined;

    const {
        authorDid,
        loader = defaultMediaUriLoader,
        formats = ["png", "webp"],
        sizes = ["thumbnail", "fullsize"],
    } = context ?? {};

    if (typeof image === "string") {
        const format = formats[0] ?? "png";

        return sizes.reduce<MediaUriCollection>((result, size) => {
            result[size] = { [format]: image };
            return result;
        }, {});
    }

    return sizes.reduce<MediaUriCollection>((result, size) => {
        result[size] = formats.reduce<Record<string, string>>((formatResult, format) => {
            formatResult[format] = loader({ authorDid, format, image, size });
            return formatResult;
        }, {});
        return result;
    }, {});
}

export const getMediaUri = (collection?: MediaUriCollection, context: { format?: string; size?: string } = {}) => {
    const { format = "png", size = "fullsize" } = context;
    return collection?.[size]?.[format];
};

export function formatMediaUri(image: Blob | string, context?: MediaUriContext): string;
export function formatMediaUri(image?: undefined, context?: MediaUriContext): undefined;
export function formatMediaUri(image?: Blob | string, context?: MediaUriContext): string | undefined;
export function formatMediaUri(image?: Blob | string, context?: MediaUriContext) {
    const { authorDid, format = "png", loader, thumbnail } = context ?? {};
    const collection = formatMediaUris(image, {
        authorDid,
        formats: [format],
        loader,
        sizes: [thumbnail ? "thumbnail" : "fullsize"],
    });
    return getMediaUri(collection, { format, size: thumbnail ? "thumbnail" : "fullsize" });
}
