import React from "react";

import { Typography } from "../typography";

import "./unknown-block.scss";

export interface UnknownBlockProps {
    block: unknown;
}

export const UnknownBlock: React.FC<UnknownBlockProps> = () => (
    <Typography className="atview-unknown-block">Unsupported block type</Typography>
);
