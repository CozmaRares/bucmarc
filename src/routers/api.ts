import { Hono } from "hono";
import type { Context } from "hono";
import {
    assignMarkCategory,
    createCategory,
    disableCategorySharing,
    deleteCategory,
    deleteMark,
    enableCategorySharing,
    getCategories,
    getCategoryById,
    getMarks,
    rotateCategorySharing,
    renameCategory,
    saveMark,
} from "@/db";
import { env } from "@/env";
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

apiRouter.post("/mark/category", async c => {
    const body = await c.req.json();
    const input = markCategorySchema.parse(body);

    try {
        const mark = await assignMarkCategory(input.url, input.categoryId);
        return c.json({ success: true, mark });
    } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
            return c.json({ success: false, error: error.message }, 404);
        }

        throw error;
    }
});

apiRouter.delete("/mark/delete/:url", async c => {
    const url = decodeUrl(c.req.param("url"));
    await deleteMark(url);
    return c.json({ success: true });
});

apiRouter.get("/category/list", async c => {
    const categories = await getCategories();
    return c.json(categories);
});

apiRouter.post("/category/create", async c => {
    const body = await c.req.json();
    const input = categoryNameSchema.parse(body);
    const category = await createCategory(input.name);

    return c.json({ success: true, category }, 201);
});

apiRouter.post("/category/rename", async c => {
    const body = await c.req.json();
    const input = categoryRenameSchema.parse(body);
    const category = await renameCategory(input.id, input.name);

    return c.json({ success: true, category });
});

apiRouter.delete("/category/delete/:id", async c => {
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id) || id < 1) {
        return c.json({ success: false, error: "Invalid category id" }, 400);
    }

    await deleteCategory(id);
    return c.json({ success: true });
});

apiRouter.post("/category/share/enable", async c => {
    const input = categoryIdSchema.parse(await c.req.json());
    const [category] = await getCategoryById(input.id);

    if (!category) {
        return c.json({ success: false, error: "Category not found" }, 404);
    }

    if (category.shareTokenHash) {
        return c.json(
            { success: false, error: "Sharing already enabled" },
            409,
        );
    }

    const { token } = await enableCategorySharing(input.id);
    return c.json({ success: true, shareUrl: buildShareUrl(token) });
});

apiRouter.post("/category/share/rotate", async c => {
    const input = categoryIdSchema.parse(await c.req.json());
    const [category] = await getCategoryById(input.id);

    if (!category) {
        return c.json({ success: false, error: "Category not found" }, 404);
    }

    const { token } = await rotateCategorySharing(input.id);
    return c.json({ success: true, shareUrl: buildShareUrl(token) });
});

apiRouter.post("/category/share/disable", async c => {
    const input = categoryIdSchema.parse(await c.req.json());
    const [category] = await getCategoryById(input.id);

    if (!category) {
        return c.json({ success: false, error: "Category not found" }, 404);
    }

    await disableCategorySharing(input.id);
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

function buildShareUrl(token: string) {
    return new URL(`/share/${token}`, env.APP_URL).href;
}

const saveUrlSchema = z.url().refine(url => {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
});

const categoryNameSchema = z.object({
    name: z.string().trim().min(1),
});

const categoryRenameSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1),
});

const markCategorySchema = z.object({
    url: z.string().url(),
    categoryId: z.number().int().positive().nullable(),
});

const categoryIdSchema = z.object({
    id: z.number().int().positive(),
});
