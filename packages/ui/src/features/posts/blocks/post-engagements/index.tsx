import React from "react";

import { type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { AtUri } from "@atproto/api";
import clsx from "clsx";

import { formatCount } from "@src/features/shared/core/utils/client-tools";

import { EngageLike } from "./engage-like";
import { EngageReposts } from "./engage-reposts";

import "./post-engagements.scss";

export interface PostEngagementsProps {
    post: PostView;
    className?: string;
}

export const PostEngagements: React.FC<PostEngagementsProps> = ({ className, post }) => {
    const { replyCount, likeCount, uri, author } = post;
    const { rkey } = new AtUri(uri);

    return (
        <div className={clsx("post-engagements", className)}>
            <div className="post-engagements__reply" title="Reply">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="post-engagements__icon">
                    <path
                        d="M3 7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V13.2C21 14.8802 21 15.7202 20.673 16.362C20.3854 16.9265 19.9265 17.3854 19.362 17.673C18.7202 18 17.8802 18 16.2 18H13.6837C13.0597 18 12.7477 18 12.4492 18.0613C12.1844 18.1156 11.9282 18.2055 11.6875 18.3285C11.4162 18.4671 11.1725 18.662 10.6852 19.0518L8.29976 20.9602C7.88367 21.2931 7.67563 21.4595 7.50054 21.4597C7.34827 21.4599 7.20422 21.3906 7.10923 21.2716C7 21.1348 7 20.8684 7 20.3355V18C6.07003 18 5.60504 18 5.22354 17.8978C4.18827 17.6204 3.37962 16.8117 3.10222 15.7765C3 15.395 3 14.93 3 14V7.8Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span title={`Replies count: ${String(replyCount || 0)}`}>
                    {replyCount ? formatCount(replyCount) : <>&nbsp;</>}
                </span>
            </div>
            <EngageReposts post={post} />
            <EngageLike likeCount={likeCount || 0} />
            <div className="post-engagements__external">
                <a
                    href={`https://bsky.app/profile/${author.handle}/post/${rkey}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-engagements__external-link"
                >
                    <svg width="16" height="16" viewBox="0 0 64 64" className="post-engagements__external-icon">
                        <title>Open in Bluesky</title>
                        <path
                            d="M18.8577 14.5224C24.1774 18.5161 29.8993 26.6136 32.0001 30.9592C34.1011 26.614 39.8227 18.516 45.1425 14.5224C48.9808 11.6407 55.2001 9.41105 55.2001 16.506C55.2001 17.923 54.3877 28.4092 53.9112 30.1116C52.255 36.0304 46.2196 37.54 40.8512 36.6262C50.2352 38.2234 52.6224 43.5136 47.467 48.8038C37.6758 58.8511 33.3942 46.2829 32.2966 43.0626C32.0954 42.4722 32.0013 42.196 31.9999 42.4309C31.9985 42.196 31.9045 42.4722 31.7033 43.0626C30.6062 46.2829 26.3247 58.8514 16.5329 48.8038C11.3774 43.5136 13.7645 38.2231 23.1487 36.6262C17.78 37.54 11.7447 36.0303 10.0887 30.1116C9.61219 28.409 8.7998 17.9228 8.7998 16.506C8.7998 9.41105 15.0195 11.6407 18.8577 14.5224Z"
                            fill="transparent"
                            strokeWidth={4}
                            stroke="currentColor"
                        />
                        <path
                            d="M41.3262 10.5062C41.5296 10.3318 41.6312 10.2446 41.6686 10.1408C41.7012 10.0498 41.7012 9.95018 41.6686 9.85918C41.6312 9.75543 41.5296 9.66818 41.3262 9.49384L34.2672 3.44331C33.917 3.14314 33.7419 2.99306 33.5937 2.98939C33.4648 2.98619 33.3417 3.04279 33.2603 3.14269C33.1667 3.25764 33.1667 3.48825 33.1667 3.94948V7.52886C31.3878 7.84007 29.7597 8.74143 28.5498 10.0949C27.2307 11.5704 26.501 13.4799 26.5 15.4592V15.9691C27.3744 14.9158 28.4663 14.0638 29.7006 13.4716C30.7889 12.9495 31.9653 12.6403 33.1667 12.5588V16.0505C33.1667 16.5118 33.1667 16.7423 33.2603 16.8573C33.3417 16.9572 33.4648 17.0138 33.5937 17.0106C33.7419 17.0069 33.917 16.8568 34.2672 16.5567L41.3262 10.5062Z"
                            fill="transparent"
                            strokeWidth={4}
                            stroke="currentColor"
                        />
                    </svg>
                </a>
            </div>
        </div>
    );
};
