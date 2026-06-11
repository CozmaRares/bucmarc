import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import {
    createCategory,
    deleteCategory,
    disableCategorySharing,
    enableCategorySharing,
    renameCategory,
} from "@/db";
import { errorResponse, HTTPStatus, successResponse } from "@/honoHelpers";
import { env } from "@/env";
import {
    isDuplicateCategoryNameError,
    isNotFoundCategoryError,
} from "@/db/errors";

export const categoryRouter = new Hono();

const categoryFieldsValidators = {
    id: z.number().int().positive(),
    name: z.string().min(1),
};

const categoryCreateSchema = z.object({
    name: categoryFieldsValidators.name,
});

categoryRouter.post("/create", zValidator("json", categoryCreateSchema), c => {
    const input = c.req.valid("json");
    return createCategory(input.name).match(
        () => successResponse(c),
        error => {
            if (isDuplicateCategoryNameError(error)) {
                return errorResponse(
                    c,
                    "Category name already exists",
                    HTTPStatus.Conflict,
                );
            }

            return errorResponse(c);
        },
    );
});

const categoryRenameSchema = z.object({
    id: categoryFieldsValidators.id,
    name: categoryFieldsValidators.name,
});

categoryRouter.post("/rename", zValidator("json", categoryRenameSchema), c => {
    const input = c.req.valid("json");
    return renameCategory(input.id, input.name).match(
        category => successResponse(c, { category }),
        error => {
            if (isDuplicateCategoryNameError(error)) {
                return errorResponse(
                    c,
                    "Category name already exists",
                    HTTPStatus.Conflict,
                );
            }

            return errorResponse(c);
        },
    );
});

const categoryDeleteSchema = z.object({
    id: categoryFieldsValidators.id,
});

categoryRouter.delete(
    "/delete",
    zValidator("json", categoryDeleteSchema),
    c => {
        const input = c.req.valid("json");
        return deleteCategory(input.id).match(
            () => successResponse(c),
            () => errorResponse(c),
        );
    },
);

const categoryIdSchema = z.object({
    id: categoryFieldsValidators.id,
});

categoryRouter.post(
    "/share/enable",
    zValidator("json", categoryIdSchema),
    c => {
        const input = c.req.valid("json");
        return enableCategorySharing(input.id).match(
            token => successResponse(c, buildShareUrl(token)),
            error => {
                if (isNotFoundCategoryError(error)) {
                    return errorResponse(
                        c,
                        "Category not found",
                        HTTPStatus.NotFound,
                    );
                }

                return errorResponse(c);
            },
        );
    },
);

categoryRouter.post(
    "/share/disable",
    zValidator("json", categoryIdSchema),
    c => {
        const input = c.req.valid("json");
        return disableCategorySharing(input.id).match(
            () => successResponse(c),
            error => {
                if (isNotFoundCategoryError(error)) {
                    return errorResponse(
                        c,
                        "Category not found",
                        HTTPStatus.NotFound,
                    );
                }
                return errorResponse(c);
            },
        );
    },
);

function buildShareUrl(token: string) {
    return new URL(`/share/${token}`, env.APP_URL).href;
}
