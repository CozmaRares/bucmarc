import { createLogger } from "@/lib/logger";

const logger = createLogger("db");

type DbError = { type: string };
export type DuplicateMarkUrlError = { type: "duplicate_mark_url" };
export type DuplicateCategoryNameError = { type: "duplicate_category_name" };
export type UnknownDbError = { type: "unknown_db_error"; error: unknown };
export type NotFoundCategoryError = { type: "not_found_category" };
export type CategoryFKError = { type: "category_fk" };
export type SharingAlreadyEnabledError = { type: "sharing_already_enabled" };

function logErrorAndCreate<Args extends any[], E extends DbError>(
    cb: (...args: Args) => E,
): (...args: Args) => E {
    return (...args) => {
        const result = cb(...args);
        let logMethod;
        if (result.type === "unknown_db_error") {
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

export const maybeDuplicateCategoryNameError = logErrorAndCreate(
    (error: unknown): DuplicateCategoryNameError | UnknownDbError =>
        isUniqueConstraintError(error)
            ? { type: "duplicate_category_name" }
            : { type: "unknown_db_error", error },
);

export const unknownDbError = logErrorAndCreate(
    (error: unknown): UnknownDbError => ({ type: "unknown_db_error", error }),
);

export const maybeCategoryFKError = logErrorAndCreate(
    (error: unknown): CategoryFKError | UnknownDbError =>
        isForeignKeyConstraintError(error)
            ? { type: "category_fk" }
            : { type: "unknown_db_error", error },
);

export const sharingAlreadyEnabledError = (): SharingAlreadyEnabledError => ({
    type: "sharing_already_enabled",
});

export const notFoundCategoryError = (): NotFoundCategoryError => ({
    type: "not_found_category",
});
