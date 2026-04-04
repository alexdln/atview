import React from "react";
import clsx from "clsx";

import "./label.scss";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    text: string;
    required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, text, required, children, ...props }) => {
    return (
        <label className={clsx("label", className)} {...props}>
            <span className={clsx("label-text", required && "label-required")}>{text}</span>
            {children}
        </label>
    );
};
