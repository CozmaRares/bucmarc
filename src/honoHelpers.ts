import type { Context } from "hono";

export const HTTPStatus = {
    // 200s
    OK: 200,

    // 300s
    MovedPermanently: 301,
    Found: 302,

    // 400s
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,

    // 500s
    ServerError: 500,
} as const;
export type HTTPStatusCode = (typeof HTTPStatus)[keyof typeof HTTPStatus];

export function successResponse<T>(
    c: Context,
    data?: T,
    status: HTTPStatusCode = HTTPStatus.OK,
) {
    return c.json({ success: true, data }, status);
}

export function errorResponse(c: Context, error?: string, status: HTTPStatusCode = HTTPStatus.ServerError) {
    return c.json({ success: false, error }, status);
}
