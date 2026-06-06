import type { Context } from "hono";

export const HTTPStatusCode = {
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
type HTTPStatusCode = (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode];

export function successResponse<T>(
    c: Context,
    data?: T,
    status: HTTPStatusCode = HTTPStatusCode.OK,
) {
    return c.json({ success: true, data }, status);
}

export function errorResponse(c: Context, error?: string, status: HTTPStatusCode = HTTPStatusCode.ServerError) {
    return c.json({ success: false, error }, status);
}
