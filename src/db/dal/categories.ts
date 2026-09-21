import { dbQuery } from "@/db/connection";
import { and, asc, desc, eq, ne, isNotNull, isNull, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
    unknownDbError,
    type UnknownDbError,
    isUniqueConstraintError,
    logErrorAndCreate,
} from "./utils";
import {
    createSeriesTitleWithEpisode,
    type MarkWithSeries,
} from "@/lib/markWithSeries";
import type { Category } from "@/db/schema";

export type DuplicateCategoryNameError = { type: "duplicate_category_name" };
export type NotFoundCategoryError = { type: "not_found_category" };

const duplicateCategoryNameError = logErrorAndCreate(
    (): DuplicateCategoryNameError => ({
        type: "duplicate_category_name",
    }),
);

const maybeDuplicateCategoryNameError = logErrorAndCreate(
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

const notFoundCategoryError = (): NotFoundCategoryError => ({
    type: "not_found_category",
});
export function isNotFoundCategoryError(error: {
    type: string;
}): error is NotFoundCategoryError {
    return error.type === "not_found_category";
}

function createMarkWithSeries(row: {
    url: string;
    title: string | null;
    categoryId: number | null;
    lastClickedAt: Date;
    createdAt: Date;
    seriesTitle: string | null;
    seriesPattern: string | null;
    seriesManualEpisode: string | null;
}) {
    return createSeriesTitleWithEpisode({
        url: row.url,
        title: row.title,
        categoryId: row.categoryId,
        lastClickedAt: row.lastClickedAt,
        createdAt: row.createdAt,
        series:
            row.seriesTitle && row.seriesPattern
                ? {
                      title: row.seriesTitle,
                      pattern: row.seriesPattern,
                      manualEpisode: row.seriesManualEpisode,
                  }
                : null,
    });
}

async function _getCategorizedMarks() {
    const categories = await dbQuery("get categories", db =>
        db.query.categories.findMany({
            columns: {
                id: true,
                name: true,
                sortOrder: true,
                showCount: true,
            },
            orderBy: [
                desc(schema.categories.sortOrder),
                desc(schema.categories.updatedAt),
            ],
        }),
    );

    const marks = await dbQuery(
        "get marks with a category joined with series",
        db =>
            db
                .select({
                    url: schema.marks.url,
                    title: schema.marks.title,
                    categoryId: schema.marks.categoryId,
                    lastClickedAt: schema.marks.lastClickedAt,
                    createdAt: schema.marks.createdAt,
                    seriesTitle: schema.series.title,
                    seriesPattern: schema.series.pattern,
                    seriesManualEpisode: schema.series.manualEpisode,
                })
                .from(schema.marks)
                .leftJoin(
                    schema.series,
                    eq(schema.series.markUrl, schema.marks.url),
                )
                .where(isNotNull(schema.marks.categoryId))
                .orderBy(asc(schema.marks.createdAt)),
    );

    const marksByCategoryId = new Map<number, MarkWithSeries[]>();

    marks.map(createMarkWithSeries).forEach(mark => {
        if (mark.categoryId === null) return;

        const categoryMarks = marksByCategoryId.get(mark.categoryId) ?? [];
        categoryMarks.push(mark);
        marksByCategoryId.set(mark.categoryId, categoryMarks);
    });

    return categories.map(category => ({
        ...category,
        marks: marksByCategoryId.get(category.id) ?? [],
    }));
}
export function getCategorizedMarks(): ResultAsync<
    Array<Category & { marks: MarkWithSeries[] }>,
    UnknownDbError
> {
    return ResultAsync.fromPromise(_getCategorizedMarks(), unknownDbError);
}

function _getUncategorizedMarks() {
    return dbQuery("get marks without a category joined with series", db =>
        db
            .select({
                url: schema.marks.url,
                title: schema.marks.title,
                categoryId: schema.marks.categoryId,
                lastClickedAt: schema.marks.lastClickedAt,
                createdAt: schema.marks.createdAt,
                seriesTitle: schema.series.title,
                seriesPattern: schema.series.pattern,
                seriesManualEpisode: schema.series.manualEpisode,
            })
            .from(schema.marks)
            .leftJoin(
                schema.series,
                eq(schema.series.markUrl, schema.marks.url),
            )
            .where(isNull(schema.marks.categoryId))
            .orderBy(asc(schema.marks.createdAt)),
    );
}
export function getUncategorizedMarks(): ResultAsync<
    MarkWithSeries[],
    UnknownDbError
> {
    return ResultAsync.fromPromise(
        _getUncategorizedMarks(),
        unknownDbError,
    ).map(marks => marks.map(createMarkWithSeries));
}

async function _getCategoryByNormalizedName(name: string, exceptId?: number) {
    const normalizedName = name.toLocaleLowerCase();
    const normalizedNamePredicate = sql`lower(trim(${schema.categories.name})) = ${normalizedName}`;
    const where =
        exceptId === undefined
            ? normalizedNamePredicate
            : and(normalizedNamePredicate, ne(schema.categories.id, exceptId));

    const categories = await dbQuery(
        "search categories for possible name duplicates",
        db =>
            db
                .select({ id: schema.categories.id })
                .from(schema.categories)
                .where(where)
                .limit(1),
    );

    return categories[0] ?? null;
}

async function _createCategory(name: string) {
    const duplicate = await _getCategoryByNormalizedName(name);

    if (duplicate) {
        return { type: "duplicate" } as const;
    }

    await dbQuery("create category", db =>
        db.insert(schema.categories).values({ name }),
    );
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

async function _updateCategory(
    id: number,
    name: string,
    sortOrder: number,
    showCount: boolean,
) {
    const duplicate = await _getCategoryByNormalizedName(name, id);

    if (duplicate) {
        return "duplicate" as const;
    }

    const categories = await dbQuery("update category", db =>
        db
            .update(schema.categories)
            .set({ name, sortOrder, showCount })
            .where(eq(schema.categories.id, id))
            .returning({ id: schema.categories.id }),
    );

    return categories.length > 0
        ? ("updated" as const)
        : ("not_found" as const);
}
export function updateCategory(
    id: number,
    name: string,
    sortOrder: number,
    showCount: boolean,
): ResultAsync<
    void,
    DuplicateCategoryNameError | UnknownDbError | NotFoundCategoryError
> {
    return ResultAsync.fromPromise(
        _updateCategory(id, name, sortOrder, showCount),
        maybeDuplicateCategoryNameError,
    ).andThen(outcome => {
        switch (outcome) {
            case "updated":
                return okAsync();
            case "duplicate":
                return errAsync(duplicateCategoryNameError());
            case "not_found":
                return errAsync(notFoundCategoryError());
        }
    });
}

async function _deleteCategory(id: number) {
    const categories = await dbQuery("delete category", db =>
        db
            .delete(schema.categories)
            .where(eq(schema.categories.id, id))
            .returning({ id: schema.categories.id }),
    );
    return categories.length > 0;
}
export function deleteCategory(
    id: number,
): ResultAsync<void, UnknownDbError | NotFoundCategoryError> {
    return ResultAsync.fromPromise(_deleteCategory(id), unknownDbError).andThen(
        deleted => (deleted ? okAsync() : errAsync(notFoundCategoryError())),
    );
}
