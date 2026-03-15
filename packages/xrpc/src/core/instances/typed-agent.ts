import { type CallOptions } from "@atproto/xrpc";
import { Agent } from "@atproto/api";

import { type QueryIdPaths, type ProcedureIdPaths } from "@src/core/types/nsid-defs";
import { type QueryParams } from "@src/core/types/query-defs";
import { type BodyData } from "@src/core/types/procedure-defs";
import { type AgentReturnType } from "@src/core/types/utilities";

export class TypedAgent extends Agent {
    async call<Path extends QueryIdPaths | ProcedureIdPaths = QueryIdPaths | ProcedureIdPaths>(
        path: Path,
        params?: QueryParams<Path>,
        body?: BodyData<Path>,
        opts?: CallOptions,
    ): Promise<AgentReturnType<Path>> {
        return super.call(path, params, body, opts) as Promise<AgentReturnType<Path>>;
    }
}
