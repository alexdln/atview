import { type schemaDict } from "@atproto/api/dist/client/lexicons";

import { type InvertedIds, type ProcedureIdPaths, type QueryIdPaths } from "./nsid-defs";

export type SchemaTypeMap = {
    string: string;
    integer: number;
    boolean: boolean;
    array: string[];
};

export type GetInstructionDefs<Path extends QueryIdPaths | ProcedureIdPaths> =
    (typeof schemaDict)[InvertedIds[Path]]["defs"] extends {
        main: { type: "query" | "procedure" };
    }
        ? (typeof schemaDict)[InvertedIds[Path]]["defs"]["main"]
        : null;

export type PropertyToType<P> = P extends { type: keyof SchemaTypeMap } ? SchemaTypeMap[P["type"]] : never;
