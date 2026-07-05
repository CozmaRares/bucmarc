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

seriesRouter.post("/create", zValidator("form", seriesCreateSchema), c => {
    const input = c.req.valid("form");
    return createSeries(input.title, input.pattern).match(
        () => successRedirect(c, { path: "/series" }),
        () => {
            return errorRedirect(c, {
                path: "/series",
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

seriesRouter.post("/update", zValidator("form", seriesUpdateSchema), c => {
    const input = c.req.valid("form");
    return updateSeries(input.id, input.title, input.pattern).match(
        () => successRedirect(c, { path: "/series" }),
        error => {
            if (isNotFoundSeriesError(error)) {
                return errorRedirect(c, {
                    path: "/series",
                    message: "Series not found.",
                });
            }

            if (isInvalidSeriesPatternError(error)) {
                return errorRedirect(c, {
                    path: "/series",
                    message: error.error,
                });
            }

            return errorRedirect(c, {
                path: "/series",
                message: "The Series could not be updated.",
            });
        },
    );
});

const seriesDeleteSchema = z.object({
    id: seriesFieldsValidators.id,
});

seriesRouter.post("/delete", zValidator("form", seriesDeleteSchema), c => {
    const input = c.req.valid("form");
    return deleteSeries(input.id).match(
        () => successRedirect(c, { path: "/series" }),
        error => {
            if (isNotFoundSeriesError(error)) {
                return errorRedirect(c, {
                    path: "/series",
                    message: "Series not found.",
                });
            }

            return errorRedirect(c, {
                path: "/series",
                message: "The Series could not be deleted.",
            });
        },
    );
});
