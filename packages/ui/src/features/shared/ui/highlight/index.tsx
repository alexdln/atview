import React from "react";

import "./highlight.scss";

export interface HighlightProps {
    children: React.ReactNode;
}

export const Highlight: React.FC<HighlightProps> = (props) => <mark className="atview-highlight" {...props} />;
