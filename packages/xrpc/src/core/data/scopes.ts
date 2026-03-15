import { ids } from "@atproto/api/dist/client/lexicons";

import { type InvertedIds } from "../types/nsid-defs";

export const invertedIds = Object.fromEntries(Object.entries(ids).map(([key, value]) => [value, key])) as InvertedIds;
