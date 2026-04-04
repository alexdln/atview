import React from "react";

import "./table.scss";

export interface TableProps {
    children: React.ReactNode;
}

export const Table: React.FC<TableProps> = (props) => (
    <figure className="atview-table-container">
        <table className="atview-table" {...props} />
    </figure>
);
