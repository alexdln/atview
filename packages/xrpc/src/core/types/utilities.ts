import { type Agent } from "@atproto/api";

import { type ProcedureIdPaths, type QueryIdPaths } from "./nsid-defs";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Fn = (...args: any[]) => any | Promise<any>;
type Prev = [never, 0, 1, 2, 3, 4, 5];

export type PathPair<Data, Prefix extends string = "", Depth extends number = 5> = Depth extends 0
    ? never
    : {
          [Key in keyof Data & string]: Data[Key] extends Fn
              ? {
                    path: `${Prefix}${Prefix extends "" ? "" : "."}${Key}`;
                    value: Data[Key];
                }
              : Data[Key] extends object
                ? Data[Key] extends readonly any[]
                    ? never
                    : Key extends `_${string}`
                      ? never
                      : PathPair<Data[Key], `${Prefix}${Prefix extends "" ? "" : "."}${Key}`, Prev[Depth]>
                : never;
      }[keyof Data & string];

export type PathKeys<T> = PathPair<T>["path"];

export type PathValue<T, P extends string> =
    Extract<PathPair<T>, { path: P }> extends { value: infer V } ? (V extends Fn ? V : Fn) : Fn;

export type Split<S extends string, D extends string> = S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export type Merge<T> = {
    [K in keyof T]: T[K];
};

export type UnionToObject<U> = Merge<UnionToIntersection<U>>;

export type UnionToMergedObject<U> = {
    [K in keyof UnionToIntersection<U>]: U extends Record<K, infer V> ? V : never;
};

export type IsEmptyObject<T> = T extends object ? (keyof T extends never ? true : false) : false;

export type ExcludeEmptyObject<U> = U extends any ? (IsEmptyObject<U> extends true ? never : U) : never;

export type AgentReturnType<Path extends QueryIdPaths | ProcedureIdPaths> = Awaited<ReturnType<PathValue<Agent, Path>>>;
