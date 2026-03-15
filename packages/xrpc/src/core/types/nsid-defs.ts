import { type ids, type schemaDict } from "@atproto/api/dist/client/lexicons";

export type Ids = typeof ids;
export type Invert<T extends Record<PropertyKey, PropertyKey>> = {
    [K in keyof T as T[K]]: K;
};
export type InvertedIds = Invert<Ids>;

export type IsQuery<Path extends keyof typeof schemaDict> = (typeof schemaDict)[Path]["defs"] extends {
    main: { type: "query" };
}
    ? true
    : false;
export type QueryIdKeys = {
    [K in keyof Ids]: IsQuery<K> extends true ? K : never;
}[keyof Ids];
export type QueryIdPaths = Ids[QueryIdKeys];

export type IsProcedure<Path extends keyof typeof schemaDict> = (typeof schemaDict)[Path]["defs"] extends {
    main: { type: "procedure" };
}
    ? true
    : false;
export type ProcedureIdKeys = {
    [K in keyof Ids]: IsProcedure<K> extends true ? K : never;
}[keyof Ids];
export type ProcedureIdPaths = Ids[ProcedureIdKeys];
