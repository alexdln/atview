"use client";

import React, { useCallback } from "react";
import { useDialogReducer, useDialogStore } from "contection-top-layer";
import { Input, Post } from "@atview/ui";
import { useQueryLoader } from "@atview/docs/client";

import { EditorDialog } from "../editor-dialog";
import { EditorPostDialogProvider } from "../../stores/top-layer/store";

const usePostLoader = (uri: string = "") => {
    const isAtUri = uri?.startsWith("at://");

    const { data: postAuthorDid } = useQueryLoader({
        path: "com.atproto.identity.resolveHandle",
        params: {
            handle: uri.split("/")[4],
        },
        enabled: Boolean(uri && !isAtUri),
    });

    const { data: postData } = useQueryLoader({
        path: "app.bsky.feed.getPosts",
        params: {
            uris: [isAtUri ? uri : `at://${postAuthorDid?.did}/app.bsky.feed.post/${uri.split("/")[6]}`],
        },
        enabled: Boolean(isAtUri || (uri && postAuthorDid?.did)),
    });

    return postData?.posts[0];
};

export const PostDialog: React.FC = () => {
    const { data } = useDialogStore(EditorPostDialogProvider);
    const [store, setDialog] = useDialogReducer(EditorPostDialogProvider);
    const post = usePostLoader(data.uri);

    const closeHandler = useCallback(() => {
        setDialog({ open: false, data: { uri: "", cid: "", text: "", onSubmit: undefined } });
    }, [setDialog]);

    const submitHandler = useCallback(
        (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();

            if (!post?.uri || !post?.cid) return;

            store.data.onSubmit?.({ uri: post.uri, cid: post.cid }, store.data.text);
            closeHandler();
        },
        [closeHandler, post],
    );

    return (
        <EditorPostDialogProvider onClose={closeHandler}>
            <EditorDialog title="Post" onClose={closeHandler} onSubmit={submitHandler}>
                <Input
                    label="Default Text"
                    type="text"
                    placeholder="Default text for text-content-only services"
                    value={data.text}
                    onChange={(e) => setDialog({ open: true, data: { ...data, text: e.target.value } })}
                />
                <Input
                    label="AT URI"
                    type="text"
                    placeholder="at://did:plc:atabc/app.bsky.feed.post/rkey"
                    required
                    value={data.uri}
                    onChange={(e) => setDialog({ open: true, data: { ...data, uri: e.target.value } })}
                />
                {post && <Post item={post} />}
            </EditorDialog>
        </EditorPostDialogProvider>
    );
};
