import React from "react";
import clsx from "clsx";

import { type Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { type AppBskyEmbedImages, type AppBskyEmbedVideo, type AppBskyEmbedExternal } from "@atproto/api";
import { isView as isVideoView, isMain as isVideo } from "@atproto/api/dist/client/types/app/bsky/embed/video";
import { isView as isExternalView, isMain as isExternal } from "@atproto/api/dist/client/types/app/bsky/embed/external";
import { isView as isImagesView, isMain as isImages } from "@atproto/api/dist/client/types/app/bsky/embed/images";
import { isViewRecord, isViewBlocked } from "@atproto/api/dist/client/types/app/bsky/embed/record";
import {
    isView as isRecordWithMediaView,
    isMain as isRecordWithMedia,
} from "@atproto/api/dist/client/types/app/bsky/embed/recordWithMedia";
import { isMain as isStrongRef } from "@atproto/api/dist/client/types/com/atproto/repo/strongRef";
import { isBlockedPost, isGeneratorView, PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { isStarterPackView, isStarterPackViewBasic } from "@atproto/api/dist/client/types/app/bsky/graph/defs";
import { CID, type MultihashDigest, type Version } from "multiformats/cid";

import { Post } from "@src/features/posts/blocks/post";
import { FeedCard } from "@src/features/feeds/blocks/feed-card";
import { VideoPlayer } from "@src/features/posts/blocks/video-player";
import { StarterPackCard, StarterPackCardProps } from "@src/features/starter-packs/blocks/starter-pack-card";

import { ImageWrapper } from "../image-wrapper";

import "./post-embed.scss";

const formatLink = (
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

const ExternalEmbed: React.FC<{
    embed: AppBskyEmbedExternal.ViewExternal | AppBskyEmbedExternal.External;
    did: string;
    className?: string;
}> = ({ embed, did, className }) => {
    const thumbLink =
        typeof embed.thumb === "object" && "ref" in embed.thumb
            ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${formatLink(embed.thumb.ref)}@jpeg`
            : String(embed.thumb);

    if (embed.uri.match("media.tenor.com\/.+AAAAC\/.+\.gif")) {
        return (
            <video
                src={embed.uri
                    .replace("https://media.tenor.com", "https://t.gifs.bsky.app")
                    .replace("AAAAC", "AAAP3")
                    .replace(/\.gif($|\?)/, ".webm")}
                controls
                preload="none"
                className="post-embed__tenor-video"
                autoPlay
                muted
                loop
            />
        );
    }

    return (
        <a
            href={embed.uri}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx("post-embed__external", className)}
        >
            {thumbLink && thumbLink !== "undefined" && (
                <img src={thumbLink} alt="" loading="lazy" className="post-embed__external-thumb" />
            )}
            <div className="post-embed__external-body">
                <p className="post-embed__external-title">{embed.title || embed.uri}</p>
                <p className="post-embed__external-description">{embed.description}</p>
                <p className="post-embed__external-host">{new URL(embed.uri).host}</p>
            </div>
        </a>
    );
};

const VideoEmbed: React.FC<{
    embed: AppBskyEmbedVideo.Main | AppBskyEmbedVideo.View;
    did: string;
    className?: string;
}> = ({ embed, did, className }) => {
    const thumbnail =
        typeof embed === "object" && "video" in embed
            ? `https://video.bsky.app/watch/${did}/${formatLink(embed.video?.ref)}/thumbnail.jpg`
            : String(embed.thumbnail);
    const playlist =
        typeof embed === "object" && "video" in embed
            ? `https://video.bsky.app/watch/${did}/${formatLink(embed.video?.ref)}/playlist.m3u8`
            : String(embed.playlist);
    return (
        <div className={clsx("post-embed__video", className)}>
            <figure className="post-embed__video-figure">
                <VideoPlayer
                    poster={thumbnail}
                    playsInline
                    controls
                    preload="none"
                    src={playlist}
                    className="post-embed__video-player"
                    muted
                    loop
                />
                <figcaption className="post-embed__video-caption">{embed.alt}</figcaption>
            </figure>
        </div>
    );
};

const ImagesEmbed: React.FC<{ embed: AppBskyEmbedImages.Main; did: string; className?: string }> = ({
    embed,
    did,
    className,
}) => {
    const multiple = embed.images.length > 1;
    const uris = embed.images.map(({ image, alt }) => ({
        img: `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${formatLink(image.ref)}@jpeg`,
        fullUri: `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${formatLink(image.ref)}@jpeg`,
        alt,
    }));

    return (
        <div className={clsx("post-embed__images", multiple && "post-embed__images--multiple", className)}>
            {embed.images.map(({ image, alt, aspectRatio }, index) => (
                <ImageWrapper
                    key={formatLink(image.ref)}
                    uris={uris}
                    index={index}
                    className={clsx("post-embed__image-item", multiple && "post-embed__image-item--multiple")}
                >
                    {!multiple && (
                        <img
                            src={`https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${formatLink(image.ref)}@jpeg`}
                            alt=""
                            width={360}
                            height={aspectRatio ? Math.ceil((360 / aspectRatio.width) * aspectRatio.height) : 360}
                            loading="lazy"
                            className="post-embed__image-blur"
                        />
                    )}
                    <img
                        src={`https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${formatLink(image.ref)}@jpeg`}
                        alt={alt}
                        width={360}
                        height={aspectRatio ? Math.ceil((360 / aspectRatio.width) * aspectRatio.height) : 360}
                        loading="lazy"
                        className={clsx(
                            "post-embed__image-main",
                            !multiple && "post-embed__image-main--single",
                            multiple && "post-embed__image-main--multiple",
                        )}
                    />
                    {alt && <div className="post-embed__alt-badge">Alt</div>}
                </ImageWrapper>
            ))}
        </div>
    );
};

const ImagesViewEmbed: React.FC<{ embed: AppBskyEmbedImages.View; did: string; className?: string }> = ({
    embed,
    className,
}) => {
    const multiple = embed.images.length > 1;
    const uris = embed.images.map(({ fullsize, thumb, alt }) => ({
        img: thumb,
        fullUri: fullsize,
        alt,
    }));

    return (
        <div className={clsx("post-embed__images", multiple && "post-embed__images--multiple", className)}>
            {embed.images.map(({ alt, thumb, aspectRatio }, index) => (
                <ImageWrapper
                    key={thumb}
                    className={clsx("post-embed__image-item", multiple && "post-embed__image-item--multiple")}
                    uris={uris}
                    index={index}
                >
                    {!multiple && (
                        <img
                            src={thumb}
                            alt=""
                            width={aspectRatio?.width}
                            height={aspectRatio?.height}
                            loading="lazy"
                            className="post-embed__image-blur"
                        />
                    )}
                    <img
                        src={thumb}
                        alt={alt}
                        width={aspectRatio?.width}
                        height={aspectRatio?.height}
                        loading="lazy"
                        className={clsx(
                            "post-embed__image-main",
                            !multiple && "post-embed__image-main--single",
                            multiple && "post-embed__image-main--multiple",
                        )}
                    />
                    {alt && <div className="post-embed__alt-badge">Alt</div>}
                </ImageWrapper>
            ))}
        </div>
    );
};

const Blocked = () => {
    return (
        <div className="post-embed__notice post-embed__notice--blocked">
            <p className="post-embed__notice-title">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                    height="14"
                    width="14"
                    className="post-embed__notice-icon"
                >
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M3.05245 2.51408C4.03771 1.6911 5.49493 1.25 7.00004 1.25c1.5051 0 2.96232 0.4411 3.94756 1.26408 1.0842 0.9056 1.706 2.44224 1.7926 4.09343 0.0866 1.6505 -0.3692 3.29207 -1.2845 4.36679 -0.98 1.1509 -2.67952 1.7757 -4.45566 1.7757 -1.77614 0 -3.47564 -0.6248 -4.45569 -1.7757 -0.91524 -1.07472 -1.37107 -2.71629 -1.28451 -4.36679 0.08659 -1.65119 0.70844 -3.18783 1.79261 -4.09343Zm8.69655 -0.95935C10.4845 0.498503 8.71831 0 7.00004 0 5.28177 0 3.51561 0.498503 2.25111 1.55473 0.823564 2.74715 0.11037 4.65779 0.0115513 6.54204 -0.0873029 8.42697 0.42108 10.409 1.59266 11.7848 2.87827 13.2945 4.97748 14 7.00004 14s4.12176 -0.7055 5.40736 -2.2152c1.1716 -1.3758 1.68 -3.35783 1.5811 -5.24276 -0.0988 -1.88425 -0.812 -3.79489 -2.2395 -4.98731ZM7.87691 3.7829c0 -0.34518 -0.27982 -0.625 -0.625 -0.625 -0.34517 0 -0.625 0.27982 -0.625 0.625v0.31657c0 0.34518 0.27983 0.625 0.625 0.625 0.34518 0 0.625 -0.27982 0.625 -0.625V3.7829ZM5.14498 6.01923c0 -0.34518 0.27982 -0.625 0.625 -0.625h0.48689c0.88685 0 1.60579 0.71894 1.60577 1.6058v1.88259c0.33235 0.03652 0.66758 0.10241 1.01035 0.19769 0.33257 0.09243 0.52723 0.43697 0.4348 0.76954 -0.09244 0.33255 -0.43698 0.52725 -0.76955 0.43485 -0.89263 -0.2482 -1.69361 -0.2482 -2.58624 0 -0.33257 0.0924 -0.67711 -0.1023 -0.76954 -0.43485 -0.09244 -0.33257 0.10223 -0.67711 0.4348 -0.76954 0.33762 -0.09384 0.66793 -0.15919 0.99538 -0.19603V7.00003c0.00001 -0.19649 -0.15928 -0.3558 -0.35577 -0.3558h-0.48689c-0.34518 0 -0.625 -0.27983 -0.625 -0.625Z"
                        clipRule="evenodd"
                        strokeWidth="1"
                    />
                </svg>
                This embed is blocked
            </p>
        </div>
    );
};

const UnknownEmbed: React.FC<{ embed: unknown }> = ({ embed }) => {
    console.log("Unknown embed", embed);

    return (
        <div className="post-embed__notice post-embed__notice--unknown">
            <p className="post-embed__notice-title">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                    height="14"
                    width="14"
                    className="post-embed__notice-icon"
                >
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M3.05245 2.51408C4.03771 1.6911 5.49493 1.25 7.00004 1.25c1.5051 0 2.96232 0.4411 3.94756 1.26408 1.0842 0.9056 1.706 2.44224 1.7926 4.09343 0.0866 1.6505 -0.3692 3.29207 -1.2845 4.36679 -0.98 1.1509 -2.67952 1.7757 -4.45566 1.7757 -1.77614 0 -3.47564 -0.6248 -4.45569 -1.7757 -0.91524 -1.07472 -1.37107 -2.71629 -1.28451 -4.36679 0.08659 -1.65119 0.70844 -3.18783 1.79261 -4.09343Zm8.69655 -0.95935C10.4845 0.498503 8.71831 0 7.00004 0 5.28177 0 3.51561 0.498503 2.25111 1.55473 0.823564 2.74715 0.11037 4.65779 0.0115513 6.54204 -0.0873029 8.42697 0.42108 10.409 1.59266 11.7848 2.87827 13.2945 4.97748 14 7.00004 14s4.12176 -0.7055 5.40736 -2.2152c1.1716 -1.3758 1.68 -3.35783 1.5811 -5.24276 -0.0988 -1.88425 -0.812 -3.79489 -2.2395 -4.98731ZM7.87691 3.7829c0 -0.34518 -0.27982 -0.625 -0.625 -0.625 -0.34517 0 -0.625 0.27982 -0.625 0.625v0.31657c0 0.34518 0.27983 0.625 0.625 0.625 0.34518 0 0.625 -0.27982 0.625 -0.625V3.7829ZM5.14498 6.01923c0 -0.34518 0.27982 -0.625 0.625 -0.625h0.48689c0.88685 0 1.60579 0.71894 1.60577 1.6058v1.88259c0.33235 0.03652 0.66758 0.10241 1.01035 0.19769 0.33257 0.09243 0.52723 0.43697 0.4348 0.76954 -0.09244 0.33255 -0.43698 0.52725 -0.76955 0.43485 -0.89263 -0.2482 -1.69361 -0.2482 -2.58624 0 -0.33257 0.0924 -0.67711 -0.1023 -0.76954 -0.43485 -0.09244 -0.33257 0.10223 -0.67711 0.4348 -0.76954 0.33762 -0.09384 0.66793 -0.15919 0.99538 -0.19603V7.00003c0.00001 -0.19649 -0.15928 -0.3558 -0.35577 -0.3558h-0.48689c-0.34518 0 -0.625 -0.27983 -0.625 -0.625Z"
                        clipRule="evenodd"
                        strokeWidth="1"
                    />
                </svg>
                Unknown Embed
            </p>
        </div>
    );
};

type Embed = PostView["embed"] | Record["embed"] | undefined;

export const PostEmbed: React.FC<{ embed: Embed; did: string }> = ({ embed, did }) => {
    if (!embed) return null;

    const embeds: React.ReactNode[] = [];

    if (isVideoView(embed) || isVideo(embed)) {
        embeds.push(<VideoEmbed embed={embed} did={did} className="post-embed__media" key="media" />);
    } else if (isImages(embed)) {
        embeds.push(<ImagesEmbed embed={embed} did={did} className="post-embed__media" key="media" />);
    } else if (isImagesView(embed)) {
        embeds.push(<ImagesViewEmbed embed={embed} did={did} className="post-embed__media" key="media" />);
    } else if (isExternalView(embed) || isExternal(embed)) {
        if (URL.canParse(embed.external.uri)) {
            embeds.push(<ExternalEmbed embed={embed.external} did={did} className="post-embed__media" key="media" />);
        }
    } else if (isRecordWithMedia(embed) || isRecordWithMediaView(embed)) {
        embeds.push(<PostEmbed embed={embed.media} did={did} key="media" />);
    }

    if ("record" in embed && embed.record) {
        if (isViewRecord(embed.record)) {
            const { value, author, ...rest } = embed.record;
            embeds.push(
                <div className="post-embed__reference post-embed__reference--post" key="reference">
                    <Post
                        item={{
                            ...rest,
                            $type: "app.bsky.feed.defs#postView",
                            record: value,
                            author: author,
                        }}
                        interactions="none"
                        plain
                    />
                </div>,
            );
        } else if (isGeneratorView(embed.record)) {
            embeds.push(
                <FeedCard
                    feed={embed.record}
                    className="post-embed__reference post-embed__reference--feed"
                    key="reference"
                />,
            );
        } else if (isViewBlocked(embed.record)) {
            embeds.push(<Blocked key="reference" />);
        } else if (isStarterPackView(embed.record) || isStarterPackViewBasic(embed.record)) {
            embeds.push(
                <StarterPackCard
                    pack={embed.record as unknown as StarterPackCardProps["pack"]}
                    className="post-embed__media"
                    key="reference"
                />,
            );
        } else if (isBlockedPost(embed.record)) {
            embeds.push(<Blocked key="reference" />);
        } else if ("record" in embed.record && embed.record.record.$type) {
            embeds.push(
                <PostEmbed did={did} embed={{ ...embed.record, $type: embed.record.$type! }} key="reference" />,
            );
        } else if (isStrongRef(embed.record) || !("$type" in embed.record)) {
            //
        } else {
            embeds.push(<UnknownEmbed embed={embed} key="reference" />);
        }
    }

    return embeds;
};
