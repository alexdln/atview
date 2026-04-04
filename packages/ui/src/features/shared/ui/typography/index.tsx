/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import clsx from "clsx";

import "./typography.scss";

const TYPOGRAPHY_SIZES = {
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    body: "p",
    body2: "p",
    caption: "span",
    subtitle1: "h6",
    subtitle2: "h6",
};

const TYPOGRAPHY_SIZE_CLASSES = {
    h1: "atview-typography-h1",
    h2: "atview-typography-h2",
    h3: "atview-typography-h3",
    h4: "atview-typography-h4",
    h5: "atview-typography-h5",
    h6: "atview-typography-h6",
    body: "atview-typography-body",
    body2: "atview-typography-body2",
    caption: "atview-typography-caption",
    subtitle1: "atview-typography-subtitle1",
    subtitle2: "atview-typography-subtitle2",
};

const TYPOGRAPHY_VARIANT_CLASSES = {
    base: "",
    handwriting: "atview-typography-handwriting",
};

export type TypographyProps<Component extends React.ElementType = "p"> = {
    size?: keyof typeof TYPOGRAPHY_SIZES;
    variant?: keyof typeof TYPOGRAPHY_VARIANT_CLASSES;
    component?: Component;
    className?: string;
    children?: React.ReactNode;
    ref?: React.RefObject<HTMLHeadingElement> | ((ref: HTMLHeadingElement) => void);
} & React.ComponentPropsWithoutRef<Component>;

export const Typography = <T extends React.ElementType = "p">({
    size = "body",
    variant = "base",
    component: Component = TYPOGRAPHY_SIZES[size] as T,
    children,
    className,
    ...props
}: TypographyProps<T>) => (
    <Component
        className={clsx(TYPOGRAPHY_SIZE_CLASSES[size], TYPOGRAPHY_VARIANT_CLASSES[variant], className)}
        {...(props as React.JSX.LibraryManagedAttributes<T, any>)}
    >
        {children}
    </Component>
);
