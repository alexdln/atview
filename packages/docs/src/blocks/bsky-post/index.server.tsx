import React from "react";
import { Post } from "@atview/ui";

import { publicAgent } from "@src/core/instances/public-agent";

import { type BskyPostProps } from "./types";

export const BskyPost: React.FC<BskyPostProps> = async ({ uri }) => {
    const { data, success } = await publicAgent.getPosts({
        uris: [uri],
    });

    if (!success || !data?.posts[0]) return null;

    return <Post item={data?.posts[0]} />;
};
