import React from "react";
import { ImageWrapper } from "@atview/ui/posts/blocks/image-wrapper";
import clsx from "clsx";

import { type Blob, formatMediaUri } from "@atview/core";

import "./media.scss";

export interface MediaProps {
    alt?: string;
    caption?: string;
    image: Blob | string;
    fullUri?: string;
    width?: string;
    height?: string;
    authorDid?: string;
    className?: string;
}

export const Media: React.FC<MediaProps> = ({ alt, caption, image, fullUri, width, height, authorDid, className }) => {
    const fullUriFinal = fullUri || formatMediaUri(image, { authorDid });
    const thumbnailUri = formatMediaUri(image, { authorDid, thumbnail: true });

    return (
        <ImageWrapper
            uris={[{ img: thumbnailUri, alt, fullUri: fullUriFinal }]}
            index={0}
            className={clsx("atview-media", className)}
        >
            <figure className="atview-media-figure">
                <div className="atview-media-image-container">
                    <img className="atview-media-image-bg" src={thumbnailUri} alt="" width={width} height={height} />
                    <img className="atview-media-image" src={thumbnailUri} alt={alt} width={width} height={height} />
                </div>
                {caption && <figcaption className="atview-media-caption">{caption}</figcaption>}
            </figure>
            {alt && <div className="atview-media-alt-badge">alt</div>}
        </ImageWrapper>
    );
};
