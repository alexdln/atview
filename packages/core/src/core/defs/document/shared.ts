import { type Cid, type l } from "@atproto/lex";

export interface Facet {
    index: {
        byteStart: number;
        byteEnd: number;
    };
    features: l.$Typed<{ [key: string]: unknown }>[];
}

export interface StringifiedCid {
    $link: string;
}

export interface Blob {
    $type: "blob";
    ref: string | Cid | StringifiedCid;
    mimeType: string;
    size: number;
}
