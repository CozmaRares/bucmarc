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
import {
    errorRedirect,
    errorResponse,
    HTTPStatus,
    successRedirect,
    successResponse,
} from "@/honoHelpers";
import { env } from "@/env";
import {
    isDuplicateCategoryNameError,
    isNotFoundCategoryError,
} from "@/db/errors";

export const categoryRouter = new Hono();

const categoryFieldsValidators = {
    id: z.coerce.number().int().positive(),
    name: z.string().trim().min(1),
};

const categoryCreateSchema = z.object({
    name: categoryFieldsValidators.name,
});

categoryRouter.post("/create", zValidator("form", categoryCreateSchema), c => {
    const input = c.req.valid("form");
    return createCategory(input.name).match(
        () => successRedirect(c, { path: "/" }),
        error => {
            if (isDuplicateCategoryNameError(error)) {
                return errorRedirect(
                    c,
                    "A Category with that name already exists.",
                    { path: "/" },
                );
            }

            return errorRedirect(c, "The Category could not be created.", {
                path: "/",
            });
        },
    );
});

const categoryRenameSchema = z.object({
    id: categoryFieldsValidators.id,
    name: categoryFieldsValidators.name,
});

categoryRouter.post("/rename", zValidator("form", categoryRenameSchema), c => {
    const input = c.req.valid("form");
    return renameCategory(input.id, input.name).match(
        () => successRedirect(c, { path: "/" }),
        error => {
            if (isDuplicateCategoryNameError(error)) {
                return errorRedirect(
                    c,
                    "A Category with that name already exists.",
                    { path: "/" },
                );
            }

            if (isNotFoundCategoryError(error)) {
                return errorRedirect(c, "Category not found.", {
                    path: "/",
                });
            }

            return errorRedirect(c, "The Category could not be renamed.", {
                path: "/",
            });
        },
    );
});

const categoryDeleteSchema = z.object({
    id: categoryFieldsValidators.id,
});

categoryRouter.post("/delete", zValidator("form", categoryDeleteSchema), c => {
    const input = c.req.valid("form");
    return deleteCategory(input.id).match(
        () => successRedirect(c, { path: "/" }),
        error => {
            if (isNotFoundCategoryError(error)) {
                return errorRedirect(c, "Category not found.", {
                    path: "/",
                });
            }

            return errorRedirect(c, "The Category could not be deleted.", {
                path: "/",
            });
        },
    );
});

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
