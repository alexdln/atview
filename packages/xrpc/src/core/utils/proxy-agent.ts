import { type QueryIdPaths, type ProcedureIdPaths } from "../types/nsid-defs";
import { type AgentReturnType } from "../types/utilities";
import { type BodyData } from "../types/procedure-defs";
import { type QueryParams } from "../types/query-defs";

export type TypedCall = <Path extends QueryIdPaths | ProcedureIdPaths = QueryIdPaths | ProcedureIdPaths>(
    path: Path,
    params?: QueryParams<Path>,
    body?: BodyData<Path>,
) => Promise<AgentReturnType<Path>>;
