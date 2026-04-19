import { astToData } from "./ast-to-data";
import { dataToAst } from "./data-to-ast";
import { formatDocument } from "./format-document";
import { processBlobs } from "./process-blobs";

export const PcktProvider = {
    dataToAst,
    astToData,
    formatDocument,
    processBlobs,
};
