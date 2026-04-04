"use client";

import React from "react";
import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";

const makeQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
                retry: false,
            },
        },
    });
};

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient();
    }

    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
};

export const QueryClientProviderWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = getQueryClient();

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
