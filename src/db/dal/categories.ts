import { db } from "../connection";
import { and, desc, eq, ne, sql, isNull } from "drizzle-orm";
import * as schema from "../schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    unknownDbError,
    type UnknownDbError,
    isUniqueConstraintError,
    logErrorAndCreate,
} from "./utils";
import type { Mark } from "./marks";
import { getShareEnabledSql } from "./utils";
import type { Series } from "./series";
import { getEpisodeIdentity } from "@/lib/seriesPattern";

export type DuplicateCategoryNameError = { type: "duplicate_category_name" };
export type NotFoundCategoryError = { type: "not_found_category" };

export const duplicateCategoryNameError = logErrorAndCreate(
    (): DuplicateCategoryNameError => ({
        type: "duplicate_category_name",
    }),
);

export const maybeDuplicateCategoryNameError = logErrorAndCreate(
    (error: unknown): DuplicateCategoryNameError | UnknownDbError =>
        isUniqueConstraintError(error)
            ? { type: "duplicate_category_name" }
            : { type: "unknown_db_error", error },
);
export function isDuplicateCategoryNameError(error: {
    type: string;
}): error is DuplicateCategoryNameError {
    return error.type === "duplicate_category_name";
}

export const notFoundCategoryError = (): NotFoundCategoryError => ({
    type: "not_found_category",
});
export function isNotFoundCategoryError(error: {
    type: string;
}): error is NotFoundCategoryError {
    return error.type === "not_found_category";
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

export type MarkWithSeries = Mark & { series: Pick<Series, "title"> | null };

function createSerieTitleWithEpisode(
    markWithSeries: Mark & { series: Pick<Series, "title" | "pattern"> | null },
): MarkWithSeries {
    const { series, ...mark } = markWithSeries;
    const returned: MarkWithSeries = { ...mark, series: null };

    if (series) {
        const episode = getEpisodeIdentity(series.pattern, mark.url) ?? "";
        returned.series = {
            title: `${series.title} ${episode}`.trim(),
        };
    }

    return returned;
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
                orderBy: [
                    desc(schema.series.updatedAt),
                    desc(schema.marks.updatedAt),
                ],
                with: {
                    series: {
                        columns: {
                            title: true,
                            pattern: true,
                        },
                    },
                },
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
    Array<Category & { marks: MarkWithSeries[] }>,
    UnknownDbError
> {
    return ResultAsync.fromPromise(_getCategorizedMarks(), unknownDbError).map(
        categories =>
            categories.map(({ marks, ...category }) => ({
                ...category,
                marks: marks.map(createSerieTitleWithEpisode),
            })),
    );
}

function _getUncategorizedMarks() {
    return db.query.marks.findMany({
        with: {
            series: {
                columns: {
                    title: true,
                    pattern: true,
                },
            },
        },
        columns: {
            url: true,
            title: true,
            categoryId: true,
        },
        orderBy: [desc(schema.series.updatedAt), desc(schema.marks.updatedAt)],
        where: isNull(schema.marks.categoryId),
    });
}
export function getUncategorizedMarks(): ResultAsync<
    MarkWithSeries[],
    UnknownDbError
> {
    return ResultAsync.fromPromise(
        _getUncategorizedMarks(),
        unknownDbError,
    ).map(marks => marks.map(createSerieTitleWithEpisode));
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

async function _createCategory(name: string) {
    const duplicate = await _getCategoryByNormalizedName(name);

    if (duplicate) {
        return { type: "duplicate" } as const;
    }

    await db.insert(schema.categories).values({ name });
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
            ? okAsync()
            : errAsync(duplicateCategoryNameError()),
    );
}

async function _renameCategory(id: number, name: string) {
    const duplicate = await _getCategoryByNormalizedName(name, id);

    if (duplicate) {
        return "duplicate" as const;
    }

    const categories = await db
        .update(schema.categories)
        .set({ name })
        .where(eq(schema.categories.id, id))
        .returning({ id: schema.categories.id });
    return categories.length > 0
        ? ("renamed" as const)
        : ("not_found" as const);
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
        switch (outcome) {
            case "renamed":
                return okAsync();
            case "duplicate":
                return errAsync(duplicateCategoryNameError());
            case "not_found":
                return errAsync(notFoundCategoryError());
        }
    });
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
        deleted => (deleted ? okAsync() : errAsync(notFoundCategoryError())),
    );
}
