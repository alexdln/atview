import React from "react";

import { type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AtUri } from "@atproto/api";
import clsx from "clsx";

import { EngageLike } from "./engage-like";
import { EngageReposts } from "./engage-reposts";
import { EngageReply } from "./engage-reply";
import { EngageExternal } from "./engage-external";

import "./post-engagements.scss";

export interface PostEngagementsProps {
    post: PostView;
    className?: string;
}

export const PostEngagements: React.FC<PostEngagementsProps> = ({ className, post }) => {
    const { uri, author } = post;
    const { rkey } = new AtUri(uri);

    return (
        <div className={clsx("post-engagements", className)}>
            <EngageReply post={post} />
            <EngageReposts post={post} />
            <EngageLike post={post} />
            <EngageExternal authorHandle={author.handle} rkey={rkey} />
        </div>
    );
};
