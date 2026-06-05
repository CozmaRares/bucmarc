import { Hono } from "hono";
import type { Context } from "hono";
import { deleteMark, getMarks, saveMark } from "@/db";
import { z } from "zod";

const apiRouter = new Hono();
export default apiRouter;

apiRouter.get("/mark/save/:url", async c => {
    const rawUrl = c.req.param("url");
    const url = decodeUrl(rawUrl);

    if (!isSaveableUrl(url)) {
        return redirectWithState(c, "invalid", url);
    }

    try {
        const result = await saveMark(url);
        return redirectWithState(c, result, url);
    } catch (error) {
        console.error(error);
        return redirectWithState(c, "error", url);
    }
});

apiRouter.get("/mark/list", async c => {
    const marks = await getMarks();
    return c.json(marks);
});

apiRouter.delete("/mark/delete/:url", async c => {
    const url = decodeUrl(c.req.param("url"));
    await deleteMark(url);
    return c.json({ success: true });
});

function decodeUrl(url: string) {
    try {
        return decodeURIComponent(url);
    } catch {
        return url;
    }
}

function isSaveableUrl(url: string) {
    return saveUrlSchema.safeParse(url).success;
}

function redirectWithState(
    c: Context,
    state: "created" | "exists" | "invalid" | "error",
    url: string,
) {
    return c.redirect(`/?state=${state}&url=${encodeURIComponent(url)}`, 302);
}

const saveUrlSchema = z
    .url()
    .refine(url => {
        const protocol = new URL(url).protocol;
        return protocol === "http:" || protocol === "https:";
    });
