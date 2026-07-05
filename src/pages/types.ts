import type { Context } from "hono";
import type { FC } from "hono/jsx";
import type { ResultAsync } from "neverthrow";
import { HTTPStatus, type HTTPStatusCode } from "@/honoHelpers";
import { createLogger } from "@/lib/logger";

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

export type Page<P> = {
    name: string;
    component: FC<P>;
    dataLoader: (c: Context) => ResultAsync<P, PageLoadError>;
};
