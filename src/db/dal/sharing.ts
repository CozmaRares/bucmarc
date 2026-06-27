import { db } from "../connection";
import { and, desc, eq, sql } from "drizzle-orm";
import * as schema from "../schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    unknownDbError,
    type UnknownDbError,
    type CategoryFKError,
} from "./utils";
import {
    notFoundCategoryError,
    type Category,
    type NotFoundCategoryError,
} from "./categories";
import type { DuplicateMarkUrlError, Mark, NotFoundMarkError } from "./marks";
import {
    deleteMarkInCategory,
    saveMarkInCategory,
    updateMarkTitleInCategory,
} from "./marks";
import { generateShareToken, hashShareToken } from "./utils";

export type ShareTokenPermissionError = { type: "share_token_permission" };

export const shareTokenPermissionError = (): ShareTokenPermissionError => ({
    type: "share_token_permission",
});
export function isShareTokenPermissionError(error: {
    type: string;
}): error is ShareTokenPermissionError {
    return error.type === "share_token_permission";
}

async function _getCategoryByShareToken(token: string | undefined) {
    if (!token) {
        return null;
    }

    const sharingEnabled = sql<boolean>`${schema.categories.shareTokenHash} is not null`;

    const categories = await db
        .select({
            id: schema.categories.id,
            name: schema.categories.name,
            sharingEnabled,
            isShareOnly: schema.categories.isShareOnly,
            isTokenManageable: schema.categories.isTokenManageable,
        })
        .from(schema.categories)
        .where(eq(schema.categories.shareTokenHash, hashShareToken(token)))
        .limit(1);

    return categories[0] ?? null;
}
export function getCategoryByShareToken(
    token: string | undefined,
): ResultAsync<Category, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _getCategoryByShareToken(token),
        unknownDbError,
    ).andThen(category =>
        category ? okAsync(category) : errAsync(notFoundCategoryError()),
    );
}

async function _getCategoryWithMarksByShareToken(token: string | undefined) {
    if (!token) {
        return null;
    }

    const category = await db.query.categories.findFirst({
        where: eq(schema.categories.shareTokenHash, hashShareToken(token)),
        columns: {
            id: true,
            name: true,
            isShareOnly: true,
            isTokenManageable: true,
        },
        with: {
            marks: {
                columns: {
                    url: true,
                    title: true,
                    categoryId: true,
                },
                orderBy: [desc(schema.marks.updatedAt)],
            },
        },
    });

    return category ?? null;
}
export function getCategoryWithMarksByShareToken(
    token: string | undefined,
): ResultAsync<
    Pick<Category, "id" | "name" | "isShareOnly" | "isTokenManageable"> & {
        marks: Mark[];
    },
    UnknownDbError | NotFoundCategoryError
> {
    return ResultAsync.fromPromise(
        _getCategoryWithMarksByShareToken(token),
        unknownDbError,
    ).andThen(category =>
        category ? okAsync(category) : errAsync(notFoundCategoryError()),
    );
}

async function _enableCategorySharing(categoryId: number) {
    const token = generateShareToken();
    const categories = await db
        .update(schema.categories)
        .set({ shareTokenHash: hashShareToken(token) })
        .where(eq(schema.categories.id, categoryId))
        .returning({ id: schema.categories.id });

    if (categories.length === 0) {
        return { type: "not_found" } as const;
    }

    return { type: "enabled", token } as const;
}
export function enableCategorySharing(
    categoryId: number,
): ResultAsync<string, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _enableCategorySharing(categoryId),
        unknownDbError,
    ).andThen(outcome => {
        switch (outcome.type) {
            case "enabled":
                return okAsync(outcome.token);
            case "not_found":
                return errAsync(notFoundCategoryError());
        }
    });
}

async function _disableCategorySharing(categoryId: number) {
    const categories = await db
        .update(schema.categories)
        .set({
            shareTokenHash: null,
            isShareOnly: false,
            isTokenManageable: false,
        })
        .where(eq(schema.categories.id, categoryId))
        .returning({ id: schema.categories.id });

    if (categories.length === 0) {
        return { type: "not_found" } as const;
    }

    return { type: "disabled" } as const;
}
export function disableCategorySharing(
    categoryId: number,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _disableCategorySharing(categoryId),
        unknownDbError,
    ).andThen(outcome => {
        switch (outcome.type) {
            case "disabled":
                return okAsync(undefined);
            case "not_found":
                return errAsync(notFoundCategoryError());
        }
    });
}

async function _setCategoryTokenManageable(
    categoryId: number,
    enabled: boolean,
) {
    const categories = await db
        .update(schema.categories)
        .set({ isTokenManageable: enabled })
        .where(
            and(
                eq(schema.categories.id, categoryId),
                sql`${schema.categories.shareTokenHash} is not null`,
            ),
        )
        .returning({ id: schema.categories.id });

    return categories.length > 0;
}
export function setCategoryTokenManageable(
    categoryId: number,
    enabled: boolean,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _setCategoryTokenManageable(categoryId, enabled),
        unknownDbError,
    ).andThen(updated =>
        updated ? okAsync(undefined) : errAsync(notFoundCategoryError()),
    );
}

async function _setCategoryShareOnly(categoryId: number, enabled: boolean) {
    const categories = await db
        .update(schema.categories)
        .set({ isShareOnly: enabled })
        .where(
            and(
                eq(schema.categories.id, categoryId),
                sql`${schema.categories.shareTokenHash} is not null`,
            ),
        )
        .returning({ id: schema.categories.id });

    return categories.length > 0;
}
export function setCategoryShareOnly(
    categoryId: number,
    enabled: boolean,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(
        _setCategoryShareOnly(categoryId, enabled),
        unknownDbError,
    ).andThen(updated =>
        updated ? okAsync(undefined) : errAsync(notFoundCategoryError()),
    );
}

export function revealCategoryByShareToken(
    token: string | undefined,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return getCategoryByShareToken(token).andThen(category =>
        setCategoryShareOnly(category.id, false),
    );
}

function getTokenManageableCategory(token: string | undefined) {
    return getCategoryByShareToken(token).andThen(category =>
        category.isTokenManageable
            ? okAsync(category)
            : errAsync(shareTokenPermissionError()),
    );
}

export function saveMarkByShareToken(
    token: string | undefined,
    url: string,
): ResultAsync<
    void,
    | UnknownDbError
    | NotFoundCategoryError
    | ShareTokenPermissionError
    | DuplicateMarkUrlError
    | CategoryFKError
> {
    return getTokenManageableCategory(token).andThen(category =>
        saveMarkInCategory(category.id, url),
    );
}

export function updateMarkTitleByShareToken(
    token: string | undefined,
    url: string,
    title: string | null | undefined,
): ResultAsync<
    void,
    | UnknownDbError
    | NotFoundCategoryError
    | ShareTokenPermissionError
    | NotFoundMarkError
> {
    return getTokenManageableCategory(token).andThen(category =>
        updateMarkTitleInCategory(category.id, url, title),
    );
}

export function deleteMarkByShareToken(
    token: string | undefined,
    url: string,
): ResultAsync<
    void,
    | UnknownDbError
    | NotFoundCategoryError
    | ShareTokenPermissionError
    | NotFoundMarkError
> {
    return getTokenManageableCategory(token).andThen(category =>
        deleteMarkInCategory(category.id, url),
    );
}
