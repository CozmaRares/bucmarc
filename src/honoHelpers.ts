import type { Context } from "hono";

const HTTPSuccessStatus = {
    OK: 200,
} as const;

const HTTPRedirectStatus = {
    MovedPermanently: 301,
    Found: 302,
} as const;

const HTTPErrorStatus = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
} as const;

const HTTPServerErrorStatus = {
    ServerError: 500,
} as const;

export const HTTPStatus = {
    ...HTTPSuccessStatus,
    ...HTTPRedirectStatus,
    ...HTTPErrorStatus,
    ...HTTPServerErrorStatus,
};

type StatusCode<T> = T extends object ? T[keyof T] : never;
export type HTTPSuccessStatusCode = StatusCode<typeof HTTPSuccessStatus>;
export type HTTPRedirectStatusCode = StatusCode<typeof HTTPRedirectStatus>;
export type HTTPErrorStatusCode = StatusCode<typeof HTTPErrorStatus>;
export type HTTPServerErrorStatusCode = StatusCode<
    typeof HTTPServerErrorStatus
>;
export type HTTPStatusCode = StatusCode<typeof HTTPStatus>;

export function successResponse<T>(
    c: Context,
    data?: T,
    status: HTTPStatusCode = HTTPStatus.OK,
) {
    return c.json({ success: true, data }, status);
}

export function errorResponse(
    c: Context,
    error?: string,
    status: HTTPStatusCode = HTTPStatus.BadRequest,
) {
    return c.json({ success: false, error }, status);
}

type RedirectParams = {
    path: string;
    status?: HTTPRedirectStatusCode;
    message?: string;
};

export function successRedirect(
    c: Context,
    { path, status = HTTPStatus.Found, message }: RedirectParams,
) {
    const url = new URL(path, c.req.url);

    if (message) {
        url.searchParams.set("message", message);
        url.searchParams.set("status", "success");
    }

    return c.redirect(url, status);
}

export function errorRedirect(
    c: Context,
    {
        path,
        status = HTTPStatus.Found,
        message,
    }: RedirectParams & { message: string },
) {
    const url = new URL(path, c.req.url);
    url.searchParams.set("message", message);
    url.searchParams.set("status", "error");

    return c.redirect(url, status);
}
