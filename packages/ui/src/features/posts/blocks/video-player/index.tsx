"use client";

import React from "react";

import Hls from "hls.js";
import { useEffect, useRef } from "react";

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
}

export const VideoPlayer = ({ src, ...props }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const hls = new Hls();
        if (Hls.isSupported() && videoRef.current) {
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            hls.on(Hls.Events.ERROR, (err) => {
                console.log(err);
            });
        } else {
            //
        }
    }, [src]);

    return <video ref={videoRef} src={src} {...props} />;
};
