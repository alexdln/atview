import React from "react";
import clsx from "clsx";

import { Label } from "../label";

import "./textarea.scss";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    required?: boolean;
    textareaClassName?: string;
}

export const Textarea = ({ className, label, required, textareaClassName, ...props }: TextareaProps) => {
    return (
        <Label text={label} required={required} className={className}>
            <textarea className={clsx("textarea", textareaClassName)} {...props} />
        </Label>
    );
};
