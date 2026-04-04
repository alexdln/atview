import { type Agent } from "@atproto/api";
import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { type QueryIdPaths, type AgentReturnType, type QueryParams } from "@atview/xrpc";

import { publicAgent } from "@src/core/instances/public-agent";

export type UseQueryLoaderOpts<Path extends QueryIdPaths, Mutation> = {
    path: Path;
    params: QueryParams<Path>;
    enabled?: boolean | React.RefObject<boolean>;
    onSuccess?: (data: AgentReturnType<Path>["data"] | null) => void;
    refetchInterval?: number;
    mutation?: Mutation;
    agent?: Agent;
};

export type BaseMutation<Path extends QueryIdPaths> = (
    data: AgentReturnType<Path>["data"],
) => Promise<AgentReturnType<Path>["data"]>;

export const useQueryLoader = <Path extends QueryIdPaths, Mutation extends BaseMutation<Path>>({
    path,
    params,
    enabled,
    onSuccess,
    refetchInterval,
    agent: providedAgent,
    mutation,
}: UseQueryLoaderOpts<Path, Mutation>) => {
    const agent = providedAgent ?? publicAgent;
    const queryClient = useQueryClient();

    const paramsKey = Object.entries(params).flat().join("_");
    const queryKey = useMemo(() => ["data-loader", path, paramsKey], [path, paramsKey]);
    const isEnabled =
        typeof window !== "undefined" && Boolean(agent) && (typeof enabled === "object" ? enabled.current : enabled);

    const query = useQuery<AgentReturnType<Path>["data"] | null>({
        queryKey,
        refetchInterval,
        queryFn: async () => {
            const isEnabledTarget =
                typeof window !== "undefined" &&
                Boolean(agent) &&
                (typeof enabled === "object" ? enabled.current : enabled);
            if (!agent || isEnabledTarget === false) return null;

            try {
                const { data, success } = await agent.call(path, params);

                if (!success) {
                    return null;
                }
                if (onSuccess) onSuccess(data);
                if (mutation) {
                    const mutatedData = await mutation(data);
                    return mutatedData || null;
                }
                return data || null;
            } catch (error) {
                if (process.env.NODE_ENV === "development") console.error("error: " + queryKey, error);
                if (error instanceof Error && "validationError" in error && params.actor === "did:me") {
                    return null;
                }

                return null;
            }
        },
        enabled: isEnabled,
        retry: false,
    });

    const restore = useCallback(() => {
        queryClient.removeQueries({ queryKey });
    }, [agent, queryClient, queryKey, params.actor]);

    const reset = useCallback(() => {
        queryClient.resetQueries({ queryKey });
    }, [queryClient, queryKey]);

    const reload = useCallback(
        (force?: boolean) => {
            if (force) {
                queryClient.invalidateQueries({ queryKey });
            } else {
                query.refetch();
            }
        },
        [queryClient, query, queryKey],
    );

    return {
        data: query.data,
        loading: query.isFetching || query.isLoading,
        reload,
        restore,
        reset,
    };
};
