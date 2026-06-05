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
    updateMark,
} from "@/db";
import { env } from "@/env";
import { z } from "zod";

const apiRouter = new Hono();
export default apiRouter;

apiRouter.get("/mark/save/:url", async c => {
    const url = decodeUrl(c.req.param("url"));
    const title = c.req.query("title");

    if (!isSaveableUrl(url)) {
        return redirectWithState(c, "invalid", url);
    }

    try {
        const result = await saveMark(url, title);

        if (result === "created") {
            return c.redirect(url, 302);
        }

        return redirectWithState(c, "exists", url);
    } catch (error) {
        console.error(error);
        return redirectWithState(c, "error", url);
    }
});

apiRouter.get("/mark/list", async c => {
    const marks = await getMarks();
    return c.json(marks);
});

apiRouter.post("/mark/update", async c => {
    const body = await c.req.parseBody();
    const parsedInput = markUpdateFormSchema.safeParse({
        url: body.url,
        title: body.title,
        categoryId: parseCategoryId(body.categoryId),
    });

    if (!parsedInput.success) {
        return redirectToHome(c, "mark-error", readUrlField(body.url));
    }

    const input = parsedInput.data;

    try {
        await updateMark(input.url, input.title, input.categoryId);
        return redirectToHome(c, "mark-updated", input.url);
    } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
            return redirectToHome(c, "mark-error", input.url);
        }

        throw error;
    }
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

apiRouter.post("/mark/delete", async c => {
    const body = await c.req.parseBody();
    const parsedInput = markDeleteFormSchema.safeParse({
        url: body.url,
    });

    if (!parsedInput.success) {
        return redirectToHome(c, "mark-error", readUrlField(body.url));
    }

    const input = parsedInput.data;

    await deleteMark(input.url);
    return redirectToHome(c, "mark-deleted");
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
    const category = await getCategoryById(input.id);

    if (!category) {
        return c.json({ success: false, error: "Category not found" }, 404);
    }

    const result = await enableCategorySharing(input.id);

    if (result === null) {
        return c.json(
            { success: false, error: "Sharing already enabled" },
            409,
        );
    }

    return c.json({ success: true, shareUrl: buildShareUrl(result.token) });
});

apiRouter.post("/category/share/rotate", async c => {
    const input = categoryIdSchema.parse(await c.req.json());
    const category = await getCategoryById(input.id);

    if (!category) {
        return c.json({ success: false, error: "Category not found" }, 404);
    }

    const result = await rotateCategorySharing(input.id);

    if (result === null) {
        return c.json({ success: false, error: "Internal error" }, 500);
    }

    return c.json({ success: true, shareUrl: buildShareUrl(result.token) });
});

apiRouter.post("/category/share/disable", async c => {
    const input = categoryIdSchema.parse(await c.req.json());
    const category = await getCategoryById(input.id);

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
    state: "exists" | "invalid" | "error",
    url: string,
) {
    return redirectToHome(c, state, url);
}

function redirectToHome(
    c: Context,
    state:
        | "exists"
        | "invalid"
        | "error"
        | "mark-updated"
        | "mark-deleted"
        | "mark-error",
    url?: string,
) {
    const params = new URLSearchParams({ state });

    if (url) {
        params.set("url", url);
    }

    return c.redirect(`/?${params.toString()}`, 302);
}

function buildShareUrl(token: string) {
    return new URL(`/share/${token}`, env.APP_URL).href;
}

const saveUrlSchema = z.url().refine(url => {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
});

const categoryNameSchema = z.object({
    name: z.string().min(1),
});

const categoryRenameSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
});

const markCategorySchema = z.object({
    url: z.url(),
    categoryId: z.number().int().positive().nullable(),
});

const markUpdateFormSchema = z.object({
    url: z.url(),
    title: z.string().optional(),
    categoryId: z.number().int().positive().nullable(),
});

const markDeleteFormSchema = z.object({
    url: z.url(),
});

const categoryIdSchema = z.object({
    id: z.number().int().positive(),
});

function parseCategoryId(input: unknown) {
    if (typeof input !== "string" || input.length === 0) {
        return null;
    }

    const categoryId = Number(input);
    return Number.isInteger(categoryId) ? categoryId : input;
}

function readUrlField(input: unknown) {
    return typeof input === "string" ? input : undefined;
}
