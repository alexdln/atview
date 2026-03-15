import { schemaDict } from "@atproto/api/dist/client/lexicons";

import { ProcedureIdPaths, type QueryIdPaths } from "../types/nsid-defs";
import { invertedIds } from "../data/scopes";

export const checkIsQueryPath = (path: string): path is QueryIdPaths => {
    if (!Object.prototype.hasOwnProperty.call(invertedIds, path)) return false;

    const defs = schemaDict[invertedIds[path as keyof typeof invertedIds]].defs;
    return "main" in defs && defs.main.type === "query";
};

export const checkIsProcedurePath = (path: string): path is ProcedureIdPaths => {
    if (!Object.prototype.hasOwnProperty.call(invertedIds, path)) return false;

    const defs = schemaDict[invertedIds[path as keyof typeof invertedIds]].defs;
    return "main" in defs && defs.main.type === "procedure";
};
