import React from "react";

import "./ordered-list.scss";

export interface OrderedListProps {
    children: React.ReactNode;
    start?: number;
}

export const OrderedList: React.FC<OrderedListProps> = ({ children, start }) => {
    return (
        <ol className="atview-ordered-list" start={start}>
            {children}
        </ol>
    );
};
