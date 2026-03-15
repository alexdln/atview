import React from "react";

import { type GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AtUri } from "@atproto/api";
import clsx from "clsx";

import { formatCount } from "@src/features/shared/core/utils/client-tools";

import "./feed-card.scss";

export interface FeedCardProps {
    feed: GeneratorView;
    className?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({ feed, className }) => {
    const { host, rkey } = new AtUri(feed.uri);
    const authorDid = feed.creator?.handle || host;

    return (
        <a href={`https://bsky.app/profile/${authorDid}/feed/${rkey}`} className={clsx("feed-card", className)}>
            <div className="feed-card__header">
                <img src={feed.avatar} alt={feed.displayName} className="feed-card__avatar" />
                <div className="feed-card__author">
                    <h3 className="feed-card__title">{feed.displayName}</h3>
                    {feed.creator?.handle && <p className="feed-card__handle">At {`@${feed.creator.handle}`}'s sky</p>}
                </div>
            </div>
            {feed.description && <p className="feed-card__description">{feed.description}</p>}
            <div className="feed-card__likes">
                Liked by{" "}
                <span className="feed-card__likes-count">{feed.likeCount ? formatCount(feed.likeCount) : "N/A"}</span>
                {!feed.likeCount || feed.likeCount > 1 ? " users" : " user"}
            </div>
        </a>
    );
};
