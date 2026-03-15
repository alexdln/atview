import {
    type AppBskyEmbedExternal,
    type AppBskyEmbedImages,
    type AppBskyEmbedRecordWithMedia,
    type AppBskyEmbedVideo,
} from "@atproto/api";
import { type NotFoundPost, type BlockedPost, type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export type Embed =
    | AppBskyEmbedExternal.View
    | AppBskyEmbedImages.View
    | AppBskyEmbedVideo.View
    | AppBskyEmbedRecordWithMedia.View;

export type BasePost = BlockedPost | NotFoundPost | PostView | { $type: string };
