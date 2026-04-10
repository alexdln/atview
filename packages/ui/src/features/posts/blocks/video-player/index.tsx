"use client";

import React, { useEffect, useRef } from "react";
import { useStore } from "contection";
import Hls from "hls.js";

import { SettingsStore } from "@src/features/shared/stores/settings/stores";

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
}

export const VideoPlayer = ({ src, autoPlay, ...props }: VideoPlayerProps) => {
    const videoAutoplay = useStore(SettingsStore, {
        mutation: (state) => state.videoAutoplay,
        enabled: autoPlay === undefined ? "always" : "never",
    });
    const targetAutoPlay = Boolean(autoPlay === undefined ? videoAutoplay : autoPlay);
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

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !autoPlay) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                if (entry.isIntersecting) {
                    void video.play().catch(() => {});
                } else {
                    video.pause();
                }
            },
            { threshold: 0.5 },
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, [targetAutoPlay]);

    return <video ref={videoRef} src={src} {...props} autoPlay={targetAutoPlay} />;
};
