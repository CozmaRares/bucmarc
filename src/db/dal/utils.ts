import { sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { createLogger } from "@/lib/logger";
import * as schema from "../schema";

const logger = createLogger("db");

export type DbError = { type: string };
export type UnknownDbError = { type: "unknown_db_error"; error: unknown };
export type CategoryFKError = { type: "category_fk" };

export function logErrorAndCreate<Args extends any[], E extends DbError>(
    cb: (...args: Args) => E,
): (...args: Args) => E {
    return (...args) => {
        const result = cb(...args);

        if (isUnknownDbError(result)) {
            logger.error(result.type, result.error, ...args);
            if (result.error instanceof Error) {
                logger.error(result.error.message, result.error.cause);
                logger.error(result.error.stack);
            }
        }

        const logMethod = isUnknownDbError(result)
            ? logger.error
            : logger.debug;
        logMethod(result.type, ...args);
        return result;
    };
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

export function isUniqueConstraintError(error: unknown) {
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

export function getShareEnabledSql() {
    return sql<boolean>`${schema.categories.shareTokenHash} is not null`;
}

export function generateShareToken() {
    return randomBytes(32).toString("base64url");
}

export function hashShareToken(token: string) {
    return createHash("sha256").update(token).digest("base64url");
}
