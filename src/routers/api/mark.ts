import { deleteMark, saveMark, updateMark } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import z from "zod";
import { HTTPStatusCode, successResponse, errorResponse } from "@/honoHelpers";
import { isDuplicateMarkUrlError } from "@/db/errors";

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

markRouter.get("/save/:url", async c => {
    const redirectWithState = (
        c: Context,
        state: "exists" | "invalid" | "error",
        url: string,
    ) => {
        const params = new URLSearchParams({ state, url });
        return c.redirect(`/?${params.toString()}`, HTTPStatusCode.Found);
    };

    const url = decodeUrl(c.req.param("url"));
    const title = c.req.query("title");

    if (!isSaveableUrl(url)) {
        return redirectWithState(c, "invalid", url);
    }

    return saveMark(url, title).match(
        () => {
            return c.redirect(url, HTTPStatusCode.Found);
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

markRouter.post("/update", zValidator("form", markUpdateSchema), async c => {
    const input = c.req.valid("form");

    try {
        await updateMark(input.url, input.title, input.categoryId);
        return c.redirect("/", HTTPStatusCode.Found);
    } catch {
        return errorResponse(c);
    }
});

const markDeleteSchema = z.object({
    url: markFieldsValidators.url,
});

markRouter.delete("/delete", zValidator("json", markDeleteSchema), async c => {
    const input = c.req.valid("json");

    try {
        await deleteMark(input.url);
        return successResponse(c);
    } catch {
        return errorResponse(c);
    }
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
