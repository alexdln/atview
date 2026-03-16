import React from "react";

import { type StarterPackViewBasic } from "@atproto/api/dist/client/types/app/bsky/graph/defs";
import { type Record } from "@atproto/api/dist/client/types/app/bsky/graph/starterpack";
import { AtUri } from "@atproto/api";
import clsx from "clsx";

import "./starter-pack-card.scss";

export interface StarterPackCardProps {
    className?: string;
    pack: Pick<StarterPackViewBasic, "creator" | "uri"> & { record: Pick<Record, "name" | "description"> };
}

export const StarterPackCard: React.FC<StarterPackCardProps> = ({ pack, className }) => {
    const { rkey } = new AtUri(pack.uri);

    return (
        <div className={clsx("starter-pack-card", className)}>
            <div className="starter-pack-card__content">
                <a
                    href={`https://bsky.app/starter-pack/${pack.creator.handle}/${rkey}`}
                    className="starter-pack-card__title-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p className="starter-pack-card__title">{pack.record.name}</p>
                </a>
                <p className="starter-pack-card__creator">
                    Starter Pack by{" "}
                    <a
                        href={`https://bsky.app/profile/${pack.creator.handle}`}
                        className="starter-pack-card__creator-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {pack.creator.displayName || `@${pack.creator.handle}`}
                    </a>
                </p>
                {pack.record.description && (
                    <a
                        href={`https://bsky.app/starter-pack/${pack.creator.handle}/${rkey}`}
                        className="starter-pack-card__description-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <p className="starter-pack-card__description">{pack.record.description}</p>
                    </a>
                )}
            </div>
        </div>
    );
};
