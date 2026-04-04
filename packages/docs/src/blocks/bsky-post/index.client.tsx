"use client";

import React from "react";
import { Post } from "@atview/ui";

import { useQueryLoader } from "@src/core/hooks/use-query-loader";

import { type BskyPostProps } from "./types";

export const BskyPost: React.FC<BskyPostProps> = ({ uri }) => {
    const { data, loading } = useQueryLoader({
        path: "app.bsky.feed.getPosts",
        params: {
            uris: [uri],
        },
    });

    if (loading || !data?.posts[0]) return null;

    return <Post item={data?.posts[0]} />;
};
