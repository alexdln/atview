/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import clsx from "clsx";

import "./link-base.scss";

const LINK_VARIANT_CLASSES = {
    accent: "atview-link-base-accent",
    neutral: "atview-link-base-neutral",
};

export type LinkBaseProps<Component extends React.ElementType = "a"> = {
    variant?: keyof typeof LINK_VARIANT_CLASSES;
    component?: Component;
    className?: string;
    children?: React.ReactNode;
    underline?: boolean;
    ref?: React.RefObject<HTMLAnchorElement> | ((ref: HTMLAnchorElement) => void);
} & React.ComponentPropsWithoutRef<Component>;

export const LinkBase = <T extends React.ElementType = "a">({
    variant = "neutral",
    component: Component = "a" as unknown as T,
    children,
    className,
    underline,
    ...props
}: LinkBaseProps<T>) => (
    <Component
        className={clsx(LINK_VARIANT_CLASSES[variant], underline && "atview-link-base-underline", className)}
        {...(props as React.JSX.LibraryManagedAttributes<T, any>)}
    >
        {children}
    </Component>
);
