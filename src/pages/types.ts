import type { Context } from "hono";
import type { FC } from "hono/jsx";
import type { ResultAsync } from "neverthrow";
import { HTTPStatus, type HTTPStatusCode } from "@/honoHelpers";

export type PageLoadError = {
    message: string;
    httpStatusCode: HTTPStatusCode;
};
export const badRequestError = (): PageLoadError => ({
    message: "Bad request",
    httpStatusCode: HTTPStatus.BadRequest,
});
export const serverError = (): PageLoadError => ({
    message: "Internal server error",
    httpStatusCode: HTTPStatus.ServerError,
});
export const notFoundError = (): PageLoadError => ({
    message: "Not found",
    httpStatusCode: HTTPStatus.NotFound,
});

export type Page<P> = {
    component: FC<P>;
    dataLoader: (c: Context) => ResultAsync<P, PageLoadError>;
};
