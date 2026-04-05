export const readBlobAsUint8Array = async (blob: Blob): Promise<Uint8Array> => {
    if (typeof blob.arrayBuffer === "function") {
        try {
            const buffer = await blob.arrayBuffer();
            return new Uint8Array(buffer);
        } catch {
            /* jsdom and some environments expose a broken arrayBuffer */
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const { result } = reader;
            if (result instanceof ArrayBuffer) {
                resolve(new Uint8Array(result));
            } else {
                reject(new TypeError("FileReader did not produce an ArrayBuffer"));
            }
        };
        reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
        reader.readAsArrayBuffer(blob);
    });
};
