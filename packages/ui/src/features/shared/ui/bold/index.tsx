import React from "react";

import "./bold.scss";

export interface BoldProps {
    children: React.ReactNode;
}

export const Bold: React.FC<BoldProps> = (props) => <b className="atview-bold" {...props} />;
