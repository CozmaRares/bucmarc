import { createSeries } from "@/db/dal";
import { errorRedirect, successRedirect } from "@/honoHelpers";
import { validateSeriesPattern } from "@/lib/seriesPattern";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

export const seriesRouter = new Hono();

const seriesCreateSchema = z.object({
    title: z.string().trim().min(1),
    pattern: z.string().trim().min(1),
});

seriesRouter.post("/create", zValidator("form", seriesCreateSchema), c => {
    const input = c.req.valid("form");
    const message = validateSeriesPattern(input.pattern);

    if (message) {
        return errorRedirect(c, { path: "/series", message });
    }

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
