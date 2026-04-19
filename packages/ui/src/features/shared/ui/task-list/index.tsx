import React from "react";

import "./task-list.scss";

export interface TaskListProps {
    children: React.ReactNode;
}

export const TaskList: React.FC<TaskListProps> = ({ children }) => {
    return <ul className="atview-task-list">{children}</ul>;
};
