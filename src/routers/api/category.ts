import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import {
    createCategory,
    deleteCategory,
    disableCategorySharing,
    enableCategorySharing,
    getCategoryById,
    renameCategory,
    rotateCategorySharing,
} from "@/db";
import { errorResponse, HTTPStatusCode, successResponse } from "@/honoHelpers";
import { env } from "@/env";

export const categoryRouter = new Hono();

const categoryFieldsValidators = {
    id: z.number().int().positive(),
    name: z.string().min(1),
};

const categoryCreateSchema = z.object({
    name: categoryFieldsValidators.name,
});

categoryRouter.post(
    "/create",
    zValidator("json", categoryCreateSchema),
    async c => {
        const input = c.req.valid("json");

        try {
            const category = await createCategory(input.name);

            if (category === null) {
                return errorResponse(
                    c,
                    "Category name already exists",
                    HTTPStatusCode.Conflict,
                );
            }

            return successResponse(c, { category });
        } catch {
            return errorResponse(c);
        }
    },
);

const categoryRenameSchema = z.object({
    id: categoryFieldsValidators.id,
    name: categoryFieldsValidators.name,
});

categoryRouter.post(
    "/rename",
    zValidator("json", categoryRenameSchema),
    async c => {
        const input = c.req.valid("json");

        try {
            const category = await renameCategory(input.id, input.name);
            if (category === null) {
                return errorResponse(
                    c,
                    "Category name already exists",
                    HTTPStatusCode.Conflict,
                );
            }

            return successResponse(c, { category });
        } catch {
            return errorResponse(c);
        }
    },
);

const categoryDeleteSchema = z.object({
    id: categoryFieldsValidators.id,
});

categoryRouter.delete(
    "/delete",
    zValidator("json", categoryDeleteSchema),
    async c => {
        const input = c.req.valid("json");

        try {
            await deleteCategory(input.id);
            return successResponse(c);
        } catch {
            return errorResponse(c);
        }
    },
);

const categoryIdSchema = z.object({
    id: categoryFieldsValidators.id,
});

categoryRouter.post(
    "/share/enable",
    zValidator("json", categoryIdSchema),
    async c => {
        const input = c.req.valid("json");

        try {
            const category = await getCategoryById(input.id);

            if (!category) {
                return errorResponse(
                    c,
                    "Category not found",
                    HTTPStatusCode.NotFound,
                );
            }

            const result = await enableCategorySharing(input.id);

            if (result === null) {
                return errorResponse(
                    c,
                    "Sharing already enabled",
                    HTTPStatusCode.Conflict,
                );
            }

            return successResponse(c, buildShareUrl(result));
        } catch {
            return errorResponse(c);
        }
    },
);

categoryRouter.post(
    "/share/rotate",
    zValidator("json", categoryIdSchema),
    async c => {
        const input = c.req.valid("json");

        try {
            const category = await getCategoryById(input.id);

            if (!category) {
                return errorResponse(
                    c,
                    "Category not found",
                    HTTPStatusCode.NotFound,
                );
            }

            const result = await rotateCategorySharing(input.id);

            if (result === null) {
                return errorResponse(
                    c,
                    "Internal error",
                    HTTPStatusCode.ServerError,
                );
            }

            return successResponse(c, buildShareUrl(result));
        } catch {
            return errorResponse(c);
        }
    },
);

categoryRouter.post(
    "/share/disable",
    zValidator("json", categoryIdSchema),
    async c => {
        const input = c.req.valid("json");

        try {
            const category = await getCategoryById(input.id);

            if (!category) {
                return errorResponse(c, "Category not found", 404);
            }

            await disableCategorySharing(input.id);
            return successResponse(c);
        } catch {
            return errorResponse(c);
        }
    },
);

function buildShareUrl(token: string) {
    return new URL(`/share/${token}`, env.APP_URL).href;
}
