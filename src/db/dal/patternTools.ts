import { eq } from "drizzle-orm";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { dbQuery } from "@/db/connection";
import * as schema from "@/db/schema";
import type { ProviderPattern, RegexSnippet } from "@/db/schema";
import { validateAndWrite, validateProviderPattern } from "@/lib/patterns";
import type { SeriesMatchType } from "@/lib/constants";
import { unknownDbError, type UnknownDbError } from "./utils";

type PatternError = string;
export type InvalidProviderPatternError = {
    type: "invalid_provider_pattern";
    error: PatternError;
};

export function isInvalidProviderPatternError(error: {
    type: string;
}): error is InvalidProviderPatternError {
    return error.type === "invalid_provider_pattern";
}

export function getRegexSnippets(): ResultAsync<
    RegexSnippet[],
    UnknownDbError
> {
    return ResultAsync.fromPromise(
        dbQuery("get regex snippets", db =>
            db
                .select()
                .from(schema.regexSnippets)
                .orderBy(schema.regexSnippets.pattern),
        ),
        unknownDbError,
    );
}

export function createRegexSnippet(
    pattern: string,
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        dbQuery("create regex snippet", db =>
            db.insert(schema.regexSnippets).values({ pattern }),
        ),
        unknownDbError,
    ).map(() => undefined);
}

export function updateRegexSnippet(
    oldPattern: string,
    pattern: string,
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        dbQuery("update regex snippet", db =>
            db
                .update(schema.regexSnippets)
                .set({ pattern })
                .where(eq(schema.regexSnippets.pattern, oldPattern)),
        ),
        unknownDbError,
    ).map(() => undefined);
}

export function deleteRegexSnippet(
    pattern: string,
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        dbQuery("delete regex snippet", db =>
            db
                .delete(schema.regexSnippets)
                .where(eq(schema.regexSnippets.pattern, pattern)),
        ),
        unknownDbError,
    ).map(() => undefined);
}

export function getProviderPatterns(): ResultAsync<
    ProviderPattern[],
    UnknownDbError
> {
    return ResultAsync.fromPromise(
        dbQuery("get provider patterns", db =>
            db
                .select()
                .from(schema.providerPatterns)
                .orderBy(schema.providerPatterns.pattern),
        ),
        unknownDbError,
    );
}

function saveProviderPattern(
    write: () => Promise<unknown>,
    pattern: string,
    matchType: SeriesMatchType,
): ResultAsync<void, UnknownDbError | InvalidProviderPatternError> {
    return ResultAsync.fromPromise(
        validateAndWrite(
            () => validateProviderPattern(pattern, matchType),
            async () => {
                await write();
                return { type: "saved" } as const;
            },
        ),
        unknownDbError,
    ).andThen(result => {
        if (result.type === "saved") {
            return okAsync();
        }

        return errAsync({
            type: "invalid_provider_pattern" as const,
            error: result.error,
        });
    });
}

export function createProviderPattern(
    pattern: string,
    matchType: SeriesMatchType,
) {
    return saveProviderPattern(
        () =>
            dbQuery("create provider pattern", db =>
                db.insert(schema.providerPatterns).values({
                    pattern,
                    matchType,
                }),
            ),
        pattern,
        matchType,
    );
}

export function updateProviderPattern(
    oldPattern: string,
    pattern: string,
    matchType: SeriesMatchType,
) {
    return saveProviderPattern(
        () =>
            dbQuery("update provider pattern", db =>
                db
                    .update(schema.providerPatterns)
                    .set({ pattern, matchType })
                    .where(eq(schema.providerPatterns.pattern, oldPattern)),
            ),
        pattern,
        matchType,
    );
}

export function deleteProviderPattern(
    pattern: string,
): ResultAsync<void, UnknownDbError> {
    return ResultAsync.fromPromise(
        dbQuery("delete provider pattern", db =>
            db
                .delete(schema.providerPatterns)
                .where(eq(schema.providerPatterns.pattern, pattern)),
        ),
        unknownDbError,
    ).map(() => undefined);
}
