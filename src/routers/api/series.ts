import {
    createSeries,
    updateSeries,
    deleteSeries,
    isNotFoundSeriesError,
    isInvalidSeriesPatternError,
} from "@/db/dal";
import { errorRedirect, successRedirect } from "@/honoHelpers";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { SERIES_PAGE_URL } from "../pagePaths";

export const seriesRouter = new Hono();

const seriesFieldsValidators = {
    id: z.coerce.number().int().positive(),
    title: z.string().trim().min(1),
    pattern: z.string().trim().min(1),
};

const seriesCreateSchema = z.object({
    title: seriesFieldsValidators.title,
    pattern: seriesFieldsValidators.pattern,
});

export const SERIES_CREATE_URL = "/api/series/create";
seriesRouter.post("/create", zValidator("form", seriesCreateSchema), c => {
    const input = c.req.valid("form");
    return createSeries(input.title, input.pattern).match(
        () => successRedirect(c, { path: SERIES_PAGE_URL }),
        error => {
            if (isInvalidSeriesPatternError(error)) {
                return errorRedirect(c, {
                    path: SERIES_PAGE_URL,
                    message: error.error,
                });
            }

            return errorRedirect(c, {
                path: SERIES_PAGE_URL,
                message: "The Series could not be created.",
            });
        },
    );
});

const seriesUpdateSchema = z.object({
    id: seriesFieldsValidators.id,
    title: seriesFieldsValidators.title,
    pattern: seriesFieldsValidators.pattern,
});

export const SERIES_UPDATE_URL = "/api/series/update";
seriesRouter.post("/update", zValidator("form", seriesUpdateSchema), c => {
    const input = c.req.valid("form");
    return updateSeries(input.id, input.title, input.pattern).match(
        () => successRedirect(c, { path: SERIES_PAGE_URL }),
        error => {
            if (isNotFoundSeriesError(error)) {
                return errorRedirect(c, {
                    path: SERIES_PAGE_URL,
                    message: "Series not found.",
                });
            }

            if (isInvalidSeriesPatternError(error)) {
                return errorRedirect(c, {
                    path: SERIES_PAGE_URL,
                    message: error.error,
                });
            }

            return errorRedirect(c, {
                path: SERIES_PAGE_URL,
                message: "The Series could not be updated.",
            });
        },
    );
});

const seriesDeleteSchema = z.object({
    id: seriesFieldsValidators.id,
});

export const SERIES_DELETE_URL = "/api/series/delete";
seriesRouter.post("/delete", zValidator("form", seriesDeleteSchema), c => {
    const input = c.req.valid("form");
    return deleteSeries(input.id).match(
        () => successRedirect(c, { path: SERIES_PAGE_URL }),
        error => {
            if (isNotFoundSeriesError(error)) {
                return errorRedirect(c, {
                    path: SERIES_PAGE_URL,
                    message: "Series not found.",
                });
            }

            return errorRedirect(c, {
                path: SERIES_PAGE_URL,
                message: "The Series could not be deleted.",
            });
        },
    );
});
