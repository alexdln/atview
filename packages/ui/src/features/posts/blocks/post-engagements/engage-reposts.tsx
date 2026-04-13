import { type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import React from "react";

import { formatCount } from "@src/features/shared/core/utils/client-tools";

import "./engage-reposts.scss";

export interface EngageRepostsProps {
    post: Pick<PostView, "uri" | "cid" | "repostCount" | "quoteCount" | "viewer">;
    onClick?: (post: Pick<PostView, "uri" | "cid">) => void;
}

export const EngageReposts: React.FC<EngageRepostsProps> = ({ post, onClick }) => {
    const { repostCount = 0, quoteCount = 0, viewer } = post;

    return (
        <button
            tabIndex={onClick ? 0 : -1}
            disabled={!onClick}
            type="button"
            className="engage-reposts"
            title="Repost"
            onClick={() => onClick?.(post)}
        >
            <svg width="16" height="16" viewBox="0 0 24 24" className="engage-reposts__icon">
                <path
                    d="M17 2L21 6M21 6L17 10M21 6H7.8C6.11984 6 5.27976 6 4.63803 6.32698C4.07354 6.6146 3.6146 7.07354 3.32698 7.63803C3 8.27976 3 9.11984 3 10.8V11M3 18H16.2C17.8802 18 18.7202 18 19.362 17.673C19.9265 17.3854 20.3854 16.9265 20.673 16.362C21 15.7202 21 14.8802 21 13.2V13M3 18L7 22M3 18L7 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={viewer?.repost ? "currentColor" : "transparent"}
                />
            </svg>
            <span title={`Reposts count: ${String(repostCount + quoteCount)}`} className="engage-reposts__count">
                {repostCount + quoteCount ? formatCount(repostCount + quoteCount) : <>&nbsp;</>}
            </span>
        </button>
    );
};
