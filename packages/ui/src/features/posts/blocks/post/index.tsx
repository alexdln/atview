import React from "react";

import { type Record } from "@atproto/api/dist/client/types/app/bsky/feed/post";
import { AtUri } from "@atproto/api";
import {
    isBlockedPost,
    isNotFoundPost,
    isPostView,
    type PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import clsx from "clsx";

import { type BasePost } from "@src/features/posts/core/types/defs";
import { PostText } from "@src/features/posts/blocks/post-text";
import { PostEmbed } from "@src/features/posts/blocks/post-embed";
import { DateTime } from "@src/features/shared/ui/date-time";
import { PostEngagements } from "../post-engagements";

import "./post.scss";

export interface PostProps {
    item?: BasePost;
    className?: string;
    interactions?: "none" | "all" | "actions";
    plain?: boolean;
}

export const Post: React.FC<PostProps> = ({ item, className, interactions = "actions", plain }) => {
    if (!item) {
        return null;
    }
    if (isBlockedPost(item)) {
        return <>Blocked</>;
    }
    if (isNotFoundPost(item)) {
        return <>Not Found</>;
    }
    if (item.$type && !isPostView(item)) {
        return <>Not a post</>;
    }

    const {
        uri,
        author,
        record: postRecord,
        embed,
        likeCount,
        quoteCount,
        repostCount,
        bookmarkCount,
    } = item as PostView;
    const record = postRecord as Record;

    const isInteracted = Boolean(likeCount || quoteCount || repostCount || bookmarkCount);
    const isAuthorLive = author.status?.isActive && author.status.status === "app.bsky.actor.status#live";
    const { rkey } = new AtUri(uri);

    return (
        <div className={clsx("post", !plain && "post_wrapped", className)}>
            <div className="post__header">
                <a
                    href={`https://bsky.app/profile/${author.handle}`}
                    className="post__avatar-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {author.avatar ? (
                        <img
                            className={clsx(
                                "post__avatar",
                                isAuthorLive ? "post__avatar--live" : "post__avatar--default",
                            )}
                            src={author.avatar.replace("/avatar/", "/avatar_thumbnail/")}
                            loading="lazy"
                            alt="avatar"
                        />
                    ) : (
                        <span
                            className={clsx(
                                "post__avatar-fallback",
                                isAuthorLive ? "post__avatar-fallback--live" : "post__avatar-fallback--default",
                            )}
                        />
                    )}
                    {isAuthorLive && <div className="post__live-dot" aria-label="Live" />}
                </a>
                <span className="post__author-meta">
                    <a
                        href={`https://bsky.app/profile/${author.handle}`}
                        className="post__author-name-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {author.displayName || author.handle}{" "}
                        <span className="post__author-handle">@{author.handle}</span>
                    </a>
                    <DateTime date={record.createdAt} className="post__date" />
                </span>
            </div>
            <PostText text={record.text} facets={record.facets} />
            {(embed || record.embed) && <PostEmbed embed={embed || record.embed} did={author.did} />}
            {interactions === "all" && isInteracted && (
                <div className="post__stats">
                    {Boolean(quoteCount) && (
                        <a
                            href={`https://bsky.app/profile/${author.handle}/post/${rkey}/quotes`}
                            className="post__stats-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {`${quoteCount} ${quoteCount === 1 ? "quote" : "quotes"}`}
                        </a>
                    )}
                    {Boolean(repostCount) && (
                        <a
                            href={`https://bsky.app/profile/${author.handle}/post/${rkey}/reposted-by`}
                            className="post__stats-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {`${repostCount} ${repostCount === 1 ? "repost" : "reposts"}`}
                        </a>
                    )}
                    {Boolean(likeCount) && (
                        <a
                            href={`https://bsky.app/profile/${author.handle}/post/${rkey}/liked-by`}
                            className="post__stats-link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {`${likeCount} ${likeCount === 1 ? "like" : "likes"}`}
                        </a>
                    )}
                    {Boolean(bookmarkCount) && (
                        <div className="post__stats-save">
                            {`${bookmarkCount} ${bookmarkCount === 1 ? "save" : "saves"}`}
                        </div>
                    )}
                </div>
            )}
            {(interactions === "all" || interactions === "actions") && (
                <PostEngagements className="post__engagements" post={item as PostView} />
            )}
        </div>
    );
};
