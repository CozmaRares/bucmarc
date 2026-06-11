import { deleteMark, saveMark, updateMark } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import z from "zod";
import { HTTPStatus, successResponse, errorResponse } from "@/honoHelpers";
import {
    isCategoryFKError,
    isDuplicateMarkUrlError,
    isNotFoundMarkError,
} from "@/db/errors";

export const markRouter = new Hono();

const markFieldsValidators = {
    url: z.url(),
    title: z.preprocess(
        value =>
            typeof value === "string" && value.trim() === "" ? null : value,
        z.string().nullable().optional(),
    ),
    categoryId: z.preprocess(
        value => (value === "" ? null : value),
        z.coerce.number().int().positive().nullable(),
    ),
};

markRouter.get("/save/:url", c => {
    const redirectWithState = (
        c: Context,
        state: "exists" | "invalid" | "error",
        url: string,
    ) => {
        const params = new URLSearchParams({ state, url });
        return c.redirect(`/?${params.toString()}`, HTTPStatus.Found);
    };

    const url = decodeUrl(c.req.param("url"));
    const title = c.req.query("title");

    if (!isSaveableUrl(url)) {
        return redirectWithState(c, "invalid", url);
    }

    return saveMark(url, title).match(
        () => {
            return c.redirect(url, HTTPStatus.Found);
        },
        error => {
            if (isDuplicateMarkUrlError(error)) {
                return redirectWithState(c, "exists", url);
            }

            return redirectWithState(c, "error", url);
        },
    );
});

const markUpdateSchema = z.object({
    url: markFieldsValidators.url,
    title: markFieldsValidators.title,
    categoryId: markFieldsValidators.categoryId,
});

markRouter.post("/update", zValidator("form", markUpdateSchema), c => {
    const input = c.req.valid("form");

    return updateMark(input.url, input.title, input.categoryId).match(
        () => c.redirect("/", HTTPStatus.Found),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorResponse(c, "Mark not found", HTTPStatus.NotFound);
            }

            if (isCategoryFKError(error)) {
                return errorResponse(
                    c,
                    "Category not found",
                    HTTPStatus.NotFound,
                );
            }

            return errorResponse(c);
        },
    );
});

const markDeleteSchema = z.object({
    url: markFieldsValidators.url,
});

markRouter.delete("/delete", zValidator("json", markDeleteSchema), c => {
    const input = c.req.valid("json");
    return deleteMark(input.url).match(
        () => successResponse(c),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorResponse(c, "Mark not found", HTTPStatus.NotFound);
            }
            return errorResponse(c);
        },
    );
});

function decodeUrl(url: string) {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
}

const saveUrlSchema = z.url().refine(url => {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
});

function isSaveableUrl(url: string) {
    return saveUrlSchema.safeParse(url).success;
}
