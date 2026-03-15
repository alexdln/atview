import React from "react";

import { type OutputSchema } from "@atproto/api/dist/client/types/app/bsky/feed/getPostThread";
import {
    isBlockedPost,
    isNotFoundPost,
    isThreadViewPost,
    type ThreadViewPost as ThreadViewPostType,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import clsx from "clsx";

import { Post } from "@src/features/posts/blocks/post";

import "./thread-view-post.scss";

export type ThreadViewPostProps = {
    item: OutputSchema;
    className?: string;
    isCurrentPostPage?: boolean;
    root?: boolean;
};

export const ThreadViewPost: React.FC<ThreadViewPostProps> = ({ item, className, isCurrentPostPage, root }) => {
    if (isBlockedPost(item.thread)) {
        return <>Blocked</>;
    }

    if (isNotFoundPost(item.thread)) {
        return <>Not Found</>;
    }

    if (item.thread.$type && !isThreadViewPost(item.thread)) {
        return <>Not a post</>;
    }

    const itemThread = item.thread as ThreadViewPostType;
    const { post, parent, replies } = itemThread;

    return (
        <div className={clsx("thread-view-post mt-4", !root && "thread-view-post_child", className)}>
            {parent && (
                <div className="thread-view-post__parent">
                    {isThreadViewPost(parent) && <ThreadViewPost item={{ thread: parent }} />}
                    {isNotFoundPost(parent) && <span className="thread-view-post__status">Deleted Post</span>}
                    {isBlockedPost(parent) && <span className="thread-view-post__status">Blocked Post</span>}
                    <span className="thread-view-post__parent-corner-left" />
                    <span className="thread-view-post__parent-corner-right" />
                </div>
            )}
            <Post item={post} isCurrentPostPage={isCurrentPostPage} isPostPage nested />
            {replies?.map((replyiedPost, index) => (
                <div key={"post" in replyiedPost ? replyiedPost.post.cid : index} className="thread-view-post__reply">
                    <ThreadViewPost item={{ thread: replyiedPost }} />
                    <span className="thread-view-post__reply-line-background" />
                    <span className="thread-view-post__reply-line-top" />
                    <span className="thread-view-post__reply-corner" />
                    {index !== replies.length - 1 && <span className="thread-view-post__reply-line-continuation" />}
                </div>
            ))}
        </div>
    );
};
