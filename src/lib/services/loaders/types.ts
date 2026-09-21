import { HTTPStatus, type HTTPStatusCode } from "@/honoHelpers";
import { createLogger } from "@/lib/logger";
import type { Context } from "hono";
import type { ResultAsync } from "neverthrow";

export type PageLoadError = {
    message: string;
    httpStatusCode: HTTPStatusCode;
};

export const serverError = (error: unknown): PageLoadError => {
    const logger = createLogger("page render");
    logger.error(error);
    return {
        message: "Internal server error",
        httpStatusCode: HTTPStatus.ServerError,
    };
};

export type PageDataLoader<Props> = (
    context: Context,
) => ResultAsync<Props, PageLoadError>;
