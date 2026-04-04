import React, { lazy, Suspense } from "react";

import { type BskyPostProps } from "./types";
import { BskyPost as BskyPostServer } from "./index.server";

const BskyPostClient = lazy(() => import("./index.client").then((module) => ({ default: module.BskyPost })));

export const BskyPost: React.FC<BskyPostProps> = ({ uri }) => {
    if ("useState" in React) {
        return (
            <Suspense fallback={<div>Loading...</div>}>
                <BskyPostClient uri={uri} />
            </Suspense>
        );
    }

    return <BskyPostServer uri={uri} />;
};
