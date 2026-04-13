"use client";

import { type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { useStore } from "contection";
import { AtUri } from "@atproto/api";
import clsx from "clsx";
import React from "react";

import { SettingsStore } from "@src/features/shared/stores/settings/stores";

import { EngageLike } from "./engage-like";
import { EngageReposts } from "./engage-reposts";
import { EngageReply } from "./engage-reply";
import { EngageExternal } from "./engage-external";

import "./post-engagements.scss";

export interface PostEngagementsProps {
    post: Pick<
        PostView,
        "uri" | "cid" | "author" | "likeCount" | "replyCount" | "repostCount" | "quoteCount" | "viewer"
    >;
    className?: string;
}

export const PostEngagements: React.FC<PostEngagementsProps> = ({ className, post }) => {
    const { interactions = {} } = useStore(SettingsStore, { keys: ["interactions"] });
    const { uri, author } = post;
    const { rkey } = new AtUri(uri);

    return (
        <div className={clsx("post-engagements", className)}>
            <EngageReply post={post} {...interactions.reply} />
            <EngageReposts post={post} {...interactions.repost} />
            <EngageLike post={post} {...interactions.like} />
            <EngageExternal authorHandle={author.handle} rkey={rkey} />
        </div>
    );
};
