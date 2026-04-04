import { type $Typed } from "@atproto/api";
import { type CID } from "multiformats/cid";

export interface Facet {
    index: {
        byteStart: number;
        byteEnd: number;
    };
    features: $Typed<{ [key: string]: unknown }>[];
}

export interface Blob {
    $type: "blob";
    ref: string | CID;
    mimeType: string;
    size: number;
}
