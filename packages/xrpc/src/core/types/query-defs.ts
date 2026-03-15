import { type ProcedureIdPaths, type QueryIdPaths } from "./nsid-defs";
import { type GetInstructionDefs, type PropertyToType, type SchemaTypeMap } from "./lex-utilities";

export type QueryParams<Path extends QueryIdPaths | ProcedureIdPaths> =
    GetInstructionDefs<Path> extends {
        parameters: {
            properties: Record<string, { type: keyof SchemaTypeMap }>;
            required?: readonly string[];
        };
    }
        ? ParamsToData<GetInstructionDefs<Path>>
        : Record<string, never>;

export type ParamsToData<
    T extends
        | {
              parameters: {
                  properties: Record<string, { type: keyof SchemaTypeMap }>;
                  required?: readonly string[];
              };
          }
        | unknown,
> = T extends {
    parameters: {
        properties: Record<string, { type: keyof SchemaTypeMap }>;
        required?: readonly string[];
    };
}
    ? {
          [K in Extract<
              T["parameters"]["required"] extends readonly string[] ? T["parameters"]["required"][number] : never,
              keyof T["parameters"]["properties"]
          >]: PropertyToType<T["parameters"]["properties"][K]>;
      } & {
          [K in Exclude<
              keyof T["parameters"]["properties"],
              T["parameters"]["required"] extends readonly string[] ? T["parameters"]["required"][number] : never
          >]?: PropertyToType<T["parameters"]["properties"][K]>;
      }
    : Record<string, never>;
