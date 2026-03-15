"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import clsx from "clsx";

import { FullViewDialogProvider } from "@src/features/shared/stores/top-layer/stores";

import "./full-view.scss";

export const FullViewDialog: React.FC = () => {
    const [, setDialogState] = useDialogReducer(FullViewDialogProvider);
    const { data: state, open } = useDialogStore(FullViewDialogProvider);
    const altRef = useRef<HTMLParagraphElement>(null);
    const [altOpened, setAltOpened] = useState(false);

    const prevImageHandler = useCallback(() => {
        setDialogState(({ data, open }) => ({
            data: { ...data, index: data.index >= 1 ? data.index - 1 : data.uris.length - 1 },
            open,
        }));
    }, []);

    const nextImageHandler = useCallback(() => {
        setDialogState(({ data, open }) => ({
            data: { ...data, index: data.index < data.uris.length - 1 ? data.index + 1 : 0 },
            open,
        }));
    }, []);

    const keyboardHandler = useCallback((e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") prevImageHandler();
        if (e.key === "ArrowRight") nextImageHandler();
    }, []);

    const closeHandler = useCallback(() => {
        setDialogState({ data: { index: 0, uris: [] }, open: false });
    }, []);

    useEffect(() => {
        document.removeEventListener("keydown", keyboardHandler);
        setAltOpened(false);
        if (open) {
            document.addEventListener("keydown", keyboardHandler);
        }

        return () => {
            document.removeEventListener("keydown", keyboardHandler);
        };
    }, [open]);

    const currentUri = state.uris[state.index];

    useEffect(() => {
        if (!open || state.uris.length === 0) return;

        const { img: previewUri, fullUri, ready } = currentUri;

        if (ready) return;

        if (!fullUri || fullUri === previewUri) {
            setDialogState(({ data, open }) => ({
                data: {
                    ...data,
                    uris: data.uris.map((uri) => ({
                        ...uri,
                        ready: uri.ready || !uri.fullUri || uri.fullUri === previewUri,
                    })),
                },
                open,
            }));
            return;
        }

        const image = new Image();

        image.onload = () => {
            setDialogState(({ data, open }) => ({
                data: {
                    ...data,
                    uris: data.uris.map((uri) => ({ ...uri, ready: uri.ready || uri.fullUri === fullUri })),
                },
                open,
            }));
        };

        image.src = fullUri;
    }, [currentUri?.fullUri || currentUri?.img]);

    return (
        <FullViewDialogProvider className="full-view-dialog">
            {state.uris?.length > 1 && (
                <>
                    <button onClick={prevImageHandler} className="full-view__nav full-view__nav--prev">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="full-view__nav-icon"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <button onClick={nextImageHandler} className="full-view__nav full-view__nav--next">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="full-view__nav-icon"
                        >
                            <path
                                d="M9 18L15 12L9 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </>
            )}
            {state.uris?.length > 0 && (
                <div className="full-view">
                    <div className="full-view__content" onClick={closeHandler}>
                        {currentUri.webp && !currentUri.ready ? (
                            <picture
                                className={clsx("full-view__image", !currentUri.ready && "full-view__image_loading")}
                            >
                                <source srcSet={currentUri.webp} type="image/webp" />
                                <img src={currentUri.img} alt="" className="full-view__image" />
                            </picture>
                        ) : (
                            <img
                                src={currentUri.ready ? currentUri.fullUri || currentUri.img : currentUri.img}
                                alt=""
                                className={clsx("full-view__image", !currentUri.ready && "full-view__image_loading")}
                            />
                        )}
                    </div>
                    {currentUri.alt && (
                        <p
                            ref={altRef}
                            className={clsx(
                                "full-view__alt",
                                altOpened ? "full-view__alt--expanded" : "full-view__alt--collapsed",
                            )}
                            onClick={(e) => {
                                e.currentTarget.scrollTo({ top: 0 });
                                e.currentTarget.scrollTop = 0;
                                setAltOpened(!altOpened);
                            }}
                        >
                            {currentUri.alt}
                        </p>
                    )}
                    {!currentUri.ready && <div className="full-view__loader" />}
                </div>
            )}
        </FullViewDialogProvider>
    );
};
