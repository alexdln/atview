import React from "react";

import "./task-list-item.scss";

export interface TaskListItemProps {
    checked: boolean;
    children: React.ReactNode;
}

export const TaskListItem: React.FC<TaskListItemProps> = ({ checked, children }) => (
    <li className="atview-task-list-item">
        <label className="atview-task-list-item__label">
            <input
                type="checkbox"
                className="atview-task-list-item__checkbox"
                checked={checked}
                disabled
                tabIndex={-1}
            />
            <span className="atview-task-list-item__text">{children}</span>
        </label>
    </li>
);
