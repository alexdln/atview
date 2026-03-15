import { type CallOptions } from "@atproto/xrpc";
import { Agent } from "@atproto/api";

import { type QueryIdPaths, type ProcedureIdPaths } from "@src/core/types/nsid-defs";
import { type QueryParams } from "@src/core/types/query-defs";
import { type BodyData } from "@src/core/types/procedure-defs";
import { type AgentReturnType } from "@src/core/types/utilities";

export class ProxyAgent extends Agent {
    didOverride?: string;

    set did(did: string) {
        this.didOverride = did;
    }

    get did() {
        return this.didOverride || this.sessionManager.did || "";
    }

    async call<Path extends QueryIdPaths | ProcedureIdPaths = QueryIdPaths | ProcedureIdPaths>(
        path: Path,
        params?: QueryParams<Path>,
        body?: BodyData<Path>,
        opts?: CallOptions,
    ): Promise<AgentReturnType<Path>> {
        return super.call(path, params, body, opts) as Promise<AgentReturnType<Path>>;
    }

    assertAuthenticated() {
        return true;
    }
}
