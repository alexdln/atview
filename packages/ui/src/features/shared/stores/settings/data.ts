import { type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export interface SettingsStoreValue {
    videoAutoplay?: boolean;
    interactions?: {
        like?: {
            onClick?: (post: Pick<PostView, "uri" | "cid">) => void;
        };
        reply?: {
            onClick?: (post: Pick<PostView, "uri" | "cid">) => void;
        };
        repost?: {
            onClick?: (post: Pick<PostView, "uri" | "cid">) => void;
        };
    };
}

export const DEFAULT_SETTINGS: SettingsStoreValue = {
    videoAutoplay: false,
};
