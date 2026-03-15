import { type ProcedureIdPaths, type QueryIdPaths } from "./nsid-defs";
import { type GetInstructionDefs, type PropertyToType, type SchemaTypeMap } from "./lex-utilities";

export type BodyData<Path extends QueryIdPaths | ProcedureIdPaths> =
    GetInstructionDefs<Path> extends {
        input: {
            schema: {
                properties: Record<string, { type: keyof SchemaTypeMap }>;
                required?: readonly string[];
            };
        };
    }
        ? BodyToData<GetInstructionDefs<Path>>
        : Record<string, never>;

export type BodyToData<
    T extends
        | {
              input: {
                  schema: {
                      properties: Record<string, { type: keyof SchemaTypeMap }>;
                      required?: readonly string[];
                  };
              };
          }
        | unknown,
> = T extends {
    input: {
        schema: {
            properties: Record<string, { type: keyof SchemaTypeMap }>;
            required?: readonly string[];
        };
    };
}
    ? {
          [K in Extract<
              T["input"]["schema"]["required"] extends readonly string[]
                  ? T["input"]["schema"]["required"][number]
                  : never,
              keyof T["input"]["schema"]["properties"]
          >]: PropertyToType<T["input"]["schema"]["properties"][K]>;
      } & {
          [K in Exclude<
              keyof T["input"]["schema"]["properties"],
              T["input"]["schema"]["required"] extends readonly string[]
                  ? T["input"]["schema"]["required"][number]
                  : never
          >]?: PropertyToType<T["input"]["schema"]["properties"][K]>;
      }
    : Record<string, never>;
