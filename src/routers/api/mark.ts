import { deleteMark, recordMarkClick, saveMark, updateMark } from "@/db/dal";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { successRedirect, errorRedirect } from "@/honoHelpers";
import {
    isCategoryFKError,
    isDuplicateMarkUrlError,
    isNotFoundMarkError,
} from "@/db/dal";
import { jobQueue } from "@/lib/jobQueue";
import { HOME_PAGE_URL } from "../pagePaths";

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

export const MARK_SAVE_URL_PREFIX = "/api/mark/save/";
markRouter.get("/save/:url", c => {
    const url = c.req.param("url");

    // don't redirect back to the saved URL
    const noRedirect = c.req.query("no-redirect") !== undefined;

    if (!isSaveableUrl(url)) {
        return errorRedirect(c, {
            path: HOME_PAGE_URL,
            message: `The URL could not be saved because it is invalid: ${url}`,
        });
    }

    return saveMark(url).match(
        () => {
            jobQueue.start();
            const path = noRedirect ? HOME_PAGE_URL : url;
            return successRedirect(c, { path });
        },
        error => {
            if (isDuplicateMarkUrlError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: `The URL could not be saved because it already exists: ${url}`,
                });
            }

            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: `The URL could not be saved: ${url}`,
            });
        },
    );
});

export const MARK_OPEN_URL = (url: string) =>
    `/api/mark/open/${encodeURIComponent(url)}`;
markRouter.get("/open/:url", c => {
    const url = c.req.param("url");

    return recordMarkClick(url).match(
        () => c.redirect(url),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: "Mark not found",
                });
            }

            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The Mark click could not be recorded.",
            });
        },
    );
});

const markUpdateSchema = z.object({
    url: markFieldsValidators.url,
    title: markFieldsValidators.title,
    categoryId: markFieldsValidators.categoryId,
});

export const MARK_UPDATE_URL = "/api/mark/update";
markRouter.post("/update", zValidator("form", markUpdateSchema), c => {
    const input = c.req.valid("form");

    return updateMark(input.url, input.title, input.categoryId).match(
        () => successRedirect(c, { path: HOME_PAGE_URL }),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: "Mark not found",
                });
            }

            if (isCategoryFKError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: "Category not found",
                });
            }

            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The Mark could not be updated.",
            });
        },
    );
});

const markDeleteSchema = z.object({
    url: markFieldsValidators.url,
});

export const MARK_DELETE_URL = "/api/mark/delete";
markRouter.post("/delete", zValidator("form", markDeleteSchema), c => {
    const input = c.req.valid("form");

    return deleteMark(input.url).match(
        () => successRedirect(c, { path: HOME_PAGE_URL }),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: "Mark not found",
                });
            }

            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The Mark could not be deleted.",
            });
        },
    );
});

const saveUrlSchema = z.url().refine(url => {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
});

function isSaveableUrl(url: string) {
    return saveUrlSchema.safeParse(url).success;
}
