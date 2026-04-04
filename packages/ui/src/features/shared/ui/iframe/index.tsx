import React from "react";

import "./iframe.scss";

export interface IframeProps {
    url: string;
}

export const Iframe: React.FC<IframeProps> = ({ url }) => (
    <iframe
        className="atview-iframe"
        src={url}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
    />
);
