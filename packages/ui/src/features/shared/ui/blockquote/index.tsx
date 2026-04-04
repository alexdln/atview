import React from "react";

import "./blockquote.scss";

export interface BlockquoteProps {
    children: React.ReactNode;
}

export const Blockquote: React.FC<BlockquoteProps> = (props) => <blockquote className="atview-blockquote" {...props} />;
