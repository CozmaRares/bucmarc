import { getProviderPatterns, type UnknownDbError } from "@/db/dal";
import type { ResultAsync } from "neverthrow";
import type { SeriesMatchType } from "@/lib/constants";
import { createProviderSeriesPattern } from "@/lib/patterns";

type ProviderDetection = {
    pattern: string;
    matchType: SeriesMatchType;
};

export function detectProviderPattern(
    url: string,
): ResultAsync<ProviderDetection | null, UnknownDbError> {
    return getProviderPatterns().map(providerPatterns => {
        for (const providerPattern of providerPatterns) {
            const match = new RegExp(providerPattern.pattern, "i").exec(url);
            if (!match) continue;

            return {
                pattern: createProviderSeriesPattern(
                    providerPattern.pattern,
                    match.groups?.title ?? "",
                ),
                matchType: providerPattern.matchType,
            };
        }

        return null;
    });
}
