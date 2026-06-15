import { db } from "./connection";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import * as schema from "./schema";
import { createHash, randomBytes } from "node:crypto";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    maybeDuplicateMarkUrlError,
    isDuplicateMarkUrlError,
    unknownDbError,
    type DuplicateMarkUrlError,
    type DuplicateCategoryNameError,
    type UnknownDbError,
    maybeDuplicateCategoryNameError,
    type NotFoundCategoryError,
    notFoundCategoryError,
    maybeCategoryFKError,
    type CategoryFKError,
    type NotFoundMarkError,
    notFoundMarkError,
    duplicateCategoryNameError,
    type ShareTokenPermissionError,
    shareTokenPermissionError,
} from "./errors";

export type Mark = Awaited<ReturnType<typeof _getMarks>>[number];
function _getMarks() {
    return db
        .select({
            url: schema.marks.url,
            title: schema.marks.title,
            categoryId: schema.marks.categoryId,
        })
        .from(schema.marks)
        .orderBy(desc(schema.marks.updatedAt));
}
export function getMarks(): ResultAsync<Mark[], UnknownDbError> {
    return ResultAsync.fromPromise(_getMarks(), unknownDbError);
}

function getShareEnabledSql() {
    return sql<boolean>`${schema.categories.shareTokenHash} is not null`;
}

export type Category = Awaited<ReturnType<typeof _getCategories>>[number];
function _getCategories() {
    return db
        .select({
            id: schema.categories.id,
            name: schema.categories.name,
            sharingEnabled: getShareEnabledSql(),
            isShareOnly: schema.categories.isShareOnly,
            isTokenManageable: schema.categories.isTokenManageable,
        })
        .from(schema.categories)
        .orderBy(desc(schema.categories.updatedAt));
}
export function getCategories(): ResultAsync<Category[], UnknownDbError> {
    return ResultAsync.fromPromise(_getCategories(), unknownDbError);
}

function _getCategorizedMarks() {
    return db.query.categories.findMany({
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
        columns: {
            id: true,
            name: true,
            isShareOnly: true,
            isTokenManageable: true,
        },
        extras: { sharingEnabled: getShareEnabledSql().as("sharing_enabled") },
        where: eq(schema.categories.isShareOnly, false),
        orderBy: [desc(schema.categories.updatedAt)],
    });
}
export function getCategorizedMarks(): ResultAsync<
    Array<Category & { marks: Mark[] }>,
    UnknownDbError
> {
    return ResultAsync.fromPromise(_getCategorizedMarks(), unknownDbError);
}

function _getUncategorizedMarks() {
    return _getMarks().where(isNull(schema.marks.categoryId));
}
export function getUncategorizedMarks(): ResultAsync<Mark[], UnknownDbError> {
    return ResultAsync.fromPromise(_getUncategorizedMarks(), unknownDbError);
}

async function _getCategoryByShareToken(token: string | undefined) {
    if (!token) {
        return null;
    }

    const categories = await _getCategories().where(
        eq(schema.categories.shareTokenHash, hashShareToken(token)),
    );

    if (categories.length === 0) {
        return null;
    }

    return categories[0]!;
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

function _getMarksByCategoryId(categoryId: number) {
    return _getMarks().where(eq(schema.marks.categoryId, categoryId));
}
export function getMarksByCategoryId(
    categoryId: number,
): ResultAsync<Mark[], UnknownDbError> {
    return ResultAsync.fromPromise(
        _getMarksByCategoryId(categoryId),
        unknownDbError,
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

async function _saveMark(url: string, title?: string | null) {
    await db.insert(schema.marks).values({ url, title });
}
export function saveMark(
    url: string,
    title?: string | null,
): ResultAsync<void, DuplicateMarkUrlError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _saveMark(url, title),
        maybeDuplicateMarkUrlError,
    );
}

async function _saveMarkInCategory(
    categoryId: number,
    url: string,
    title?: string | null,
) {
    await db.insert(schema.marks).values({ url, title, categoryId });
}
function saveMarkInCategory(
    categoryId: number,
    url: string,
    title?: string | null,
): ResultAsync<void, DuplicateMarkUrlError | CategoryFKError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _saveMarkInCategory(categoryId, url, title),
        error => {
            const duplicate = maybeDuplicateMarkUrlError(error);

            if (isDuplicateMarkUrlError(duplicate)) {
                return duplicate;
            }

            return maybeCategoryFKError(error);
        },
    );
}

async function _deleteMark(url: string) {
    const marks = await db
        .delete(schema.marks)
        .where(eq(schema.marks.url, url))
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}
export function deleteMark(
    url: string,
): ResultAsync<void, UnknownDbError | NotFoundMarkError> {
    return ResultAsync.fromPromise(_deleteMark(url), unknownDbError).andThen(
        deleted =>
            deleted ? okAsync(undefined) : errAsync(notFoundMarkError()),
    );
}

async function _createCategory(name: string) {
    const trimmedName = name.trim();
    const duplicate = await _getCategoryByNormalizedName(trimmedName);

    if (duplicate) {
        return { type: "duplicate" } as const;
    }

    await db.insert(schema.categories).values({ name: trimmedName });
    return { type: "created" } as const;
}
export function createCategory(
    name: string,
): ResultAsync<void, DuplicateCategoryNameError | UnknownDbError> {
    return ResultAsync.fromPromise(
        _createCategory(name),
        maybeDuplicateCategoryNameError,
    ).andThen(outcome =>
        outcome.type === "created"
            ? okAsync(undefined)
            : errAsync(duplicateCategoryNameError()),
    );
}

async function _renameCategory(id: number, name: string) {
    const trimmedName = name.trim();
    const duplicate = await _getCategoryByNormalizedName(trimmedName, id);

    if (duplicate) {
        return { type: "duplicate" } as const;
    }

    const categories = await db
        .update(schema.categories)
        .set({ name: trimmedName })
        .where(eq(schema.categories.id, id))
        .returning({ id: schema.categories.id });
    return categories.length > 0
        ? ({ type: "renamed" } as const)
        : ({ type: "not_found" } as const);
}
export function renameCategory(
    id: number,
    name: string,
): ResultAsync<
    void,
    DuplicateCategoryNameError | UnknownDbError | NotFoundCategoryError
> {
    return ResultAsync.fromPromise(
        _renameCategory(id, name),
        maybeDuplicateCategoryNameError,
    ).andThen(outcome => {
        switch (outcome.type) {
            case "renamed":
                return okAsync(undefined);
            case "duplicate":
                return errAsync(duplicateCategoryNameError());
            case "not_found":
                return errAsync(notFoundCategoryError());
        }
    });
}

async function _getCategoryByNormalizedName(name: string, exceptId?: number) {
    const normalizedName = name.toLocaleLowerCase();
    const normalizedNamePredicate = sql`lower(trim(${schema.categories.name})) = ${normalizedName}`;
    const where =
        exceptId === undefined
            ? normalizedNamePredicate
            : and(normalizedNamePredicate, ne(schema.categories.id, exceptId));

    const categories = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(where)
        .limit(1);

    return categories[0] ?? null;
}

async function _deleteCategory(id: number) {
    const categories = await db
        .delete(schema.categories)
        .where(eq(schema.categories.id, id))
        .returning({ id: schema.categories.id });
    return categories.length > 0;
}
export function deleteCategory(
    id: number,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(_deleteCategory(id), unknownDbError).andThen(
        deleted =>
            deleted ? okAsync(undefined) : errAsync(notFoundCategoryError()),
    );
}

async function _updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
): Promise<boolean> {
    const marks = await db
        .update(schema.marks)
        .set({
            title,
            categoryId,
        })
        .where(eq(schema.marks.url, url))
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}
export function updateMark(
    url: string,
    title: string | null | undefined,
    categoryId: number | null,
): ResultAsync<void, UnknownDbError | CategoryFKError | NotFoundMarkError> {
    return ResultAsync.fromPromise(
        _updateMark(url, title, categoryId),
        maybeCategoryFKError,
    ).andThen(updated =>
        updated ? okAsync(undefined) : errAsync(notFoundMarkError()),
    );
}

async function _updateMarkTitleInCategory(
    categoryId: number,
    url: string,
    title: string | null | undefined,
): Promise<boolean> {
    const marks = await db
        .update(schema.marks)
        .set({ title })
        .where(
            and(
                eq(schema.marks.url, url),
                eq(schema.marks.categoryId, categoryId),
            ),
        )
        .returning({ url: schema.marks.url });
    return marks.length > 0;
}

async function _deleteMarkInCategory(categoryId: number, url: string) {
    const marks = await db
        .delete(schema.marks)
        .where(
            and(
                eq(schema.marks.url, url),
                eq(schema.marks.categoryId, categoryId),
            ),
        )
        .returning({ url: schema.marks.url });
    return marks.length > 0;
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
    title?: string | null,
): ResultAsync<
    void,
    | UnknownDbError
    | NotFoundCategoryError
    | ShareTokenPermissionError
    | DuplicateMarkUrlError
    | CategoryFKError
> {
    return getTokenManageableCategory(token).andThen(category =>
        saveMarkInCategory(category.id, url, title),
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
        ResultAsync.fromPromise(
            _updateMarkTitleInCategory(category.id, url, title),
            unknownDbError,
        ).andThen(updated =>
            updated ? okAsync(undefined) : errAsync(notFoundMarkError()),
        ),
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
        ResultAsync.fromPromise(
            _deleteMarkInCategory(category.id, url),
            unknownDbError,
        ).andThen(deleted =>
            deleted ? okAsync(undefined) : errAsync(notFoundMarkError()),
        ),
    );
}

function generateShareToken() {
    return randomBytes(32).toString("base64url");
}

function hashShareToken(token: string) {
    return createHash("sha256").update(token).digest("base64url");
}
