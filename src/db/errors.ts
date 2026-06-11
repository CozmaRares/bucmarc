import { createLogger } from "@/lib/logger";

const logger = createLogger("db");

type Errors =
    | {
          type: "duplicate_mark_url";
          report: false;
      }
    | {
          type: "duplicate_category_name";
          report: true;
      }
    | {
          type: "unknown_db_error";
          report: true;
      };

export type DbError = Errors & { error: unknown };

function logErrorAndCreate(
    cb: (error: unknown) => DbError,
): (error: unknown) => DbError;
function logErrorAndCreate<T>(
    cb: (error: unknown, data: T) => DbError,
): (error: unknown, data: T) => DbError;

function logErrorAndCreate<T>(cb: (error: unknown, data: T) => DbError) {
    return (error: unknown, data: T) => {
        const result = cb(error, data);
        let logMethod;
        if (result.report) {
            logMethod = logger.error;
        } else {
            logMethod = logger.debug;
        }
        logMethod(result.type, error);
        return result;
    };
}

export const duplicateMarkUrlError = logErrorAndCreate(
    (error: unknown): DbError => ({
        type: "duplicate_mark_url",
        error,
        report: false,
    }),
);

export const duplicateCategoryNameError = logErrorAndCreate(
    (error: unknown): DbError => ({
        type: "duplicate_category_name",
        error,
        report: true,
    }),
);

export const unknownDbError = logErrorAndCreate(
    (error: unknown): DbError => ({
        type: "unknown_db_error",
        error,
        report: true,
    }),
);

export function classifyDbError(
    error: unknown,
    options?: {
        expectDuplicate?: "mark_url" | "category_name";
    },
): DbError {
    // @ts-expect-error
    logger.fatal(error.toString());
    logger.fatal(`${error}`);
    logger.fatal(typeof (error as Error).cause);
    logger.fatal(`${(error as Error).cause}`);

    if (
        options?.expectDuplicate === "mark_url" &&
        isUniqueConstraintError(error)
    ) {
        return duplicateMarkUrlError(error);
    }

    if (
        options?.expectDuplicate === "category_name" &&
        isUniqueConstraintError(error)
    ) {
        return duplicateCategoryNameError(error);
    }

    return unknownDbError(error);
}

export function isDuplicateMarkUrlError(error: DbError) {
    return error.type === "duplicate_mark_url";
}

export function isDuplicateCategoryNameError(error: DbError) {
    return error.type === "duplicate_category_name";
}

function isUniqueConstraintError(error: unknown) {
    return (
        error instanceof Error &&
        /UNIQUE constraint failed/i.test(`${error.message} ${error.cause}`)
    );
}
