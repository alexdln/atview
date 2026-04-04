export const bytePositionToCharPosition = (raw: string, bytePosition: number) => {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    const charPosition = textDecoder.decode(textEncoder.encode(raw).slice(0, bytePosition)).length;

    return charPosition;
};

export const charPositionToBytePosition = (raw: string, charPosition: number) => {
    const textEncoder = new TextEncoder();
    const bytePosition = textEncoder.encode(raw.slice(0, charPosition)).length;

    return bytePosition;
};
