import { createLogger } from "@/lib/logger";

const logger = createLogger("db");

type _DbError = { type: string };
export type DuplicateMarkUrlError = { type: "duplicate_mark_url" };
export type DuplicateCategoryNameError = { type: "duplicate_category_name" };
export type UnknownDbError = { type: "unknown_db_error"; error: unknown };
export type NotFoundMarkError = { type: "not_found_mark" };
export type NotFoundCategoryError = { type: "not_found_category" };
export type CategoryFKError = { type: "category_fk" };
export type DbError =
    | DuplicateMarkUrlError
    | DuplicateCategoryNameError
    | UnknownDbError
    | NotFoundMarkError
    | NotFoundCategoryError
    | CategoryFKError;

function logErrorAndCreate<Args extends any[], E extends _DbError>(
    cb: (...args: Args) => E,
): (...args: Args) => E {
    return (...args) => {
        const result = cb(...args);
        let logMethod;
        // @ts-expect-error
        if (isUnknownDbError(result)) {
            logMethod = logger.error;
        } else {
            logMethod = logger.debug;
        }
        logMethod(result.type, ...args);
        return result;
    };
}

function isUniqueConstraintError(error: unknown) {
    return (
        error instanceof Error &&
        /UNIQUE constraint failed/i.test(`${error.message} ${error.cause}`)
    );
}

function isForeignKeyConstraintError(error: unknown) {
    return (
        error instanceof Error &&
        /FOREIGN KEY constraint failed/i.test(`${error.message} ${error.cause}`)
    );
}

export const maybeDuplicateMarkUrlError = logErrorAndCreate(
    (error: unknown): DuplicateMarkUrlError | UnknownDbError =>
        isUniqueConstraintError(error)
            ? { type: "duplicate_mark_url" }
            : { type: "unknown_db_error", error },
);
export function isDuplicateMarkUrlError(
    error: DbError,
): error is DuplicateMarkUrlError {
    return error.type === "duplicate_mark_url";
}

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
export function isDuplicateCategoryNameError(
    error: DbError,
): error is DuplicateCategoryNameError {
    return error.type === "duplicate_category_name";
}

export const unknownDbError = logErrorAndCreate(
    (error: unknown): UnknownDbError => ({ type: "unknown_db_error", error }),
);
export function isUnknownDbError(error: DbError): error is UnknownDbError {
    return error.type === "unknown_db_error";
}

export const maybeCategoryFKError = logErrorAndCreate(
    (error: unknown): CategoryFKError | UnknownDbError =>
        isForeignKeyConstraintError(error)
            ? { type: "category_fk" }
            : { type: "unknown_db_error", error },
);
export function isCategoryFKError(error: DbError): error is CategoryFKError {
    return error.type === "category_fk";
}

export const notFoundCategoryError = (): NotFoundCategoryError => ({
    type: "not_found_category",
});
export function isNotFoundCategoryError(
    error: DbError,
): error is NotFoundCategoryError {
    return error.type === "not_found_category";
}

export const notFoundMarkError = (): NotFoundMarkError => ({
    type: "not_found_mark",
});
export function isNotFoundMarkError(
    error: DbError,
): error is NotFoundMarkError {
    return error.type === "not_found_mark";
}
