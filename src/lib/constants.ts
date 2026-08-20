export const SERIES_MATCH_TYPES = Object.freeze([
    "deterministic",
    "ambiguous",
] as const);

export type SeriesMatchType = (typeof SERIES_MATCH_TYPES)[number];
