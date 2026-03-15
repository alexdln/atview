import React, { Fragment } from "react";

import { type AppBskyRichtextFacet } from "@atproto/api";
import { isLink } from "@atproto/api/dist/client/types/app/bsky/richtext/facet";

import {
    bytePositionToCharPosition,
    charPositionToBytePosition,
    getFacetLink,
} from "@src/features/posts/core/utils/rich-text";

import "./post-text.scss";

export interface PostTextProps {
    text: string;
    facets?: AppBskyRichtextFacet.Main[];
}

const bytesToChars = bytePositionToCharPosition;
const charsToBytes = charPositionToBytePosition;

export const PostText: React.FC<PostTextProps> = ({ text: oldText, facets: oldFacets }) => {
    let text = oldText;
    const facets = JSON.parse(JSON.stringify(oldFacets || [])) as AppBskyRichtextFacet.Main[];
    facets?.forEach(({ features, index }, idx) => {
        if (isLink(features[0])) {
            const charsStart = bytesToChars(text, index.byteStart);
            const charsEnd = bytesToChars(text, index.byteEnd);
            text = text.substring(0, charsStart) + features[0].uri + text.substring(charsEnd);

            const charsOrig = charsEnd - charsStart;
            const charsDiff = features[0].uri.length - charsOrig;
            index.byteEnd = charsToBytes(text, charsEnd + charsDiff);
            facets!.slice(idx + 1).forEach((f) => {
                f.index.byteStart = charsToBytes(text, bytesToChars(text, f.index.byteStart) + charsDiff);
                f.index.byteEnd = charsToBytes(text, bytesToChars(text, f.index.byteEnd) + charsDiff);
            });
        }
    });
    if (!facets?.length) return <p className="post-text">{text}</p>;

    const facetsSorted = [...facets]
        .sort((a, b) => a.index.byteStart - b.index.byteStart)
        .filter((facet, index) => {
            if (index > 0 && facets[index - 1].index.byteEnd > facet.index.byteStart) return false;
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
        [text.substring(0, bytePositionToCharPosition(text, facetsSorted[0].index.byteStart))],
    );

    return <p className="post-text">{result}</p>;
};
