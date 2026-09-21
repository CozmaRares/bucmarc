import {
    deleteMark,
    recordMarkClick,
    resolveAmbiguousMarks,
    saveMark,
    updateMark,
} from "@/db/dal";
import type { AmbiguousMarkResolution } from "@/db/dal";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { successRedirect, errorRedirect } from "@/honoHelpers";
import {
    isCategoryFKError,
    isDuplicateMarkUrlError,
    isNotFoundMarkError,
    isNotFoundSeriesError,
} from "@/db/dal";
import { jobQueue } from "@/lib/services/jobQueue";
import { HOME_PAGE_URL } from "@/routers/pagePaths";

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
markRouter.get("/save/:url", async c => {
    const url = c.req.param("url");

    // don't redirect back to the saved URL
    const noRedirect = c.req.query("no-redirect") !== undefined;

    if (!isSaveableUrl(url)) {
        return errorRedirect(c, {
            path: HOME_PAGE_URL,
            message: `The URL could not be saved because it is invalid: ${url}`,
        });
    }

    return await saveMark(url).match(
        async () => {
            if (!noRedirect) {
                void jobQueue.start();
                return successRedirect(c, { path: url });
            }

            await jobQueue.start();
            return successRedirect(c, { path: HOME_PAGE_URL });
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

export const MARK_RESOLVE_AMBIGUOUS_URL = "/api/mark/resolve-ambiguous";
markRouter.post("/resolve-ambiguous", async c => {
    const body = await c.req.parseBody();
    const count = Number(body.count);

    if (!Number.isInteger(count) || count < 0) {
        return errorRedirect(c, {
            path: HOME_PAGE_URL,
            message: "The ambiguous Marks could not be resolved.",
        });
    }

    const resolutions: AmbiguousMarkResolution[] = [];

    for (let i = 0; i < count; i++) {
        const markUrl = body[`markUrl_${i}`];
        const seriesId = body[`seriesId_${i}`];
        const episode = body[`episode_${i}`];

        if (typeof markUrl !== "string" || typeof seriesId !== "string") {
            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The ambiguous Marks could not be resolved.",
            });
        }

        const parsedUrl = markFieldsValidators.url.safeParse(markUrl);

        if (!parsedUrl.success) {
            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The ambiguous Marks could not be resolved.",
            });
        }

        if (seriesId === "") {
            resolutions.push({
                type: "no_match",
                markUrl: parsedUrl.data,
            });
            continue;
        }

        const parsedSeriesId = z.coerce
            .number()
            .int()
            .positive()
            .safeParse(seriesId);

        if (!parsedSeriesId.success) {
            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The ambiguous Marks could not be resolved.",
            });
        }

        resolutions.push({
            type: "series",
            markUrl: parsedUrl.data,
            seriesId: parsedSeriesId.data,
            episode:
                typeof episode === "string" && episode.trim() !== ""
                    ? episode.trim()
                    : null,
        });
    }

    return await resolveAmbiguousMarks(resolutions).match(
        () => successRedirect(c, { path: HOME_PAGE_URL }),
        error => {
            if (isNotFoundMarkError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: "Mark not found",
                });
            }

            if (isNotFoundSeriesError(error)) {
                return errorRedirect(c, {
                    path: HOME_PAGE_URL,
                    message: "Series not found.",
                });
            }

            return errorRedirect(c, {
                path: HOME_PAGE_URL,
                message: "The ambiguous Marks could not be resolved.",
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
