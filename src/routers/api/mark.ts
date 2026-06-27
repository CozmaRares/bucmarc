import { deleteMark, saveMark, updateMark } from "@/db/dal";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { successRedirect, errorRedirect } from "@/honoHelpers";
import {
    isCategoryFKError,
    isDuplicateMarkUrlError,
    isNotFoundMarkError,
} from "@/db/dal";

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
    const url = decodeUrl(c.req.param("url"));

    if (!isSaveableUrl(url)) {
        return errorRedirect(c, {
            path: "/",
            message: `The URL could not be saved because it is invalid: ${url}`,
        });
    }

    return saveMark(url).match(
        () => {
            return successRedirect(c, { path: url });
        },
        error => {
            if (isDuplicateMarkUrlError(error)) {
                return errorRedirect(c, {
                    path: "/",
                    message: `The URL could not be saved because it already exists: ${url}`,
                });
            }

            return errorRedirect(c, {
                path: "/",
                message: `The URL could not be saved: ${url}`,
            });
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
        () => successRedirect(c, { path: "/" }),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorRedirect(c, {
                    path: "/",
                    message: "Mark not found",
                });
            }

            if (isCategoryFKError(error)) {
                return errorRedirect(c, {
                    path: "/",
                    message: "Category not found",
                });
            }

            return errorRedirect(c, {
                path: "/",
                message: "The Mark could not be updated.",
            });
        },
    );
});

const markDeleteSchema = z.object({
    url: markFieldsValidators.url,
});

markRouter.post("/delete", zValidator("form", markDeleteSchema), c => {
    const input = c.req.valid("form");

    return deleteMark(input.url).match(
        () => successRedirect(c, { path: "/" }),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorRedirect(c, {
                    path: "/",
                    message: "Mark not found",
                });
            }

            return errorRedirect(c, {
                path: "/",
                message: "The Mark could not be deleted.",
            });
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
