import { type AppBskyRichtextFacet } from "@atproto/api";
import React, { Fragment } from "react";

import { bytePositionToCharPosition, getFacetLink } from "@src/features/posts/core/utils/rich-text";

import "./post-text.scss";

export interface PostTextProps {
    text: string;
    facets?: AppBskyRichtextFacet.Main[];
}

export const PostText: React.FC<PostTextProps> = ({ text, facets = [] }) => {
    const facetsSorted = [...facets]
        .sort((a, b) => a.index.byteStart - b.index.byteStart)
        .filter((facet, index, self) => {
            if (index > 0 && self[index - 1].index.byteEnd > facet.index.byteStart) return false;
            return true;
        });

    const result = facetsSorted.reduce<Array<string | React.ReactNode>>(
        (acc, facet, index) => {
            const nextFacetStart = facetsSorted[index + 1]
                ? bytePositionToCharPosition(text, facetsSorted[index + 1].index.byteStart)
                : undefined;

            const href = getFacetLink(facet.features[0]);
            acc.push(
                href ? (
                    <a
                        key={facet.index.byteStart + index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="post-text__link"
                    >
                        {text.substring(
                            bytePositionToCharPosition(text, facet.index.byteStart),
                            bytePositionToCharPosition(text, facet.index.byteEnd),
                        )}
                    </a>
                ) : (
                    <Fragment key={`${facet.index.byteStart}_${index}`}>
                        {text.substring(
                            bytePositionToCharPosition(text, facet.index.byteStart),
                            bytePositionToCharPosition(text, facet.index.byteEnd),
                        )}
                    </Fragment>
                ),
                <Fragment key={`${facet.index.byteStart}_${index}_next`}>
                    {text.substring(bytePositionToCharPosition(text, facet.index.byteEnd), nextFacetStart)}
                </Fragment>,
            );
            return acc;
        },
        [
            facetsSorted.length
                ? text.substring(0, bytePositionToCharPosition(text, facetsSorted[0].index.byteStart))
                : text,
        ],
    );

    return <p className="post-text">{result}</p>;
};
