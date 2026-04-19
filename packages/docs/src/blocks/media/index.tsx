import React from "react";
import { ImageWrapper } from "@atview/ui/posts/blocks/image-wrapper";
import clsx from "clsx";

import { type Blob, type MediaUriLoader, formatMediaUris, getMediaUri } from "@atview/core";

import "./media.scss";

export interface MediaProps {
    alt?: string;
    caption?: string;
    image: Blob | string;
    width?: string | number;
    height?: string | number;
    title?: string;
    authorDid?: string;
    loader?: MediaUriLoader;
    className?: string;
}

export const Media: React.FC<MediaProps> = ({
    alt,
    caption,
    image,
    width,
    height,
    title,
    authorDid,
    loader,
    className,
}) => {
    const mediaUris = formatMediaUris(image, { authorDid, formats: ["png", "webp"], loader });
    const fullUri = getMediaUri(mediaUris);
    const thumbnailUri = getMediaUri(mediaUris, { size: "thumbnail" }) || fullUri || "";
    const webpUri = getMediaUri(mediaUris, { format: "webp" });

    return (
        <ImageWrapper
            uris={[{ img: thumbnailUri, alt, fullUri, webp: webpUri }]}
            index={0}
            className={clsx("atview-media", className)}
        >
            <figure className="atview-media-figure">
                <div className="atview-media-image-container">
                    <img className="atview-media-image-bg" src={thumbnailUri} alt="" width={width} height={height} />
                    <img
                        className="atview-media-image"
                        src={thumbnailUri}
                        alt={alt}
                        width={width}
                        height={height}
                        title={title}
                    />
                </div>
                {caption && <figcaption className="atview-media-caption">{caption}</figcaption>}
            </figure>
            {alt && <div className="atview-media-alt-badge">alt</div>}
        </ImageWrapper>
    );
};
