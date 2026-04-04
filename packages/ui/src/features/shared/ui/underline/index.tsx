import React from "react";

import "./underline.scss";

export interface UnderlineProps {
    children: React.ReactNode;
}

export const Underline: React.FC<UnderlineProps> = (props) => <u className="atview-underline" {...props} />;
