import { describe, expect, test } from "vitest";

import { ENGINES } from "@src/core/data/engines";

describe("ENGINES", () => {
    test("providers wired", () => {
        expect(ENGINES.atview_facets.provider.dataToAst).toBeDefined();
        expect(ENGINES.leaflet_blocks.provider.dataToAst).toBeDefined();
        expect(ENGINES.leaflet_blocks_old.provider.dataToAst).toBeDefined();
    });
});
