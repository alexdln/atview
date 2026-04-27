import { type AppBskyRichtextFacet } from "@atproto/api";
import React from "react";

import { getFacetLink } from "@src/features/posts/core/utils/rich-text";

import "./rich-text-feature.scss";

export interface RichTextFeatureProps {
    features: AppBskyRichtextFacet.Main["features"];
    children: React.ReactNode;
}

export const RichTextFeature: React.FC<RichTextFeatureProps> = ({ features, children }) => {
    const href = getFacetLink(features[0]);
    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="rich-text-feature__link">
                {children}
            </a>
        );
    }

    return children;
};
