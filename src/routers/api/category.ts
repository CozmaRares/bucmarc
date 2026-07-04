import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import {
    createCategory,
    deleteCategory,
    updateCategory,
} from "@/db/dal";
import { errorRedirect, successRedirect } from "@/honoHelpers";
import {
    isDuplicateCategoryNameError,
    isNotFoundCategoryError,
} from "@/db/dal";

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
                return errorRedirect(c, {
                    path: "/",
                    message: "A Category with that name already exists.",
                });
            }

            return errorRedirect(c, {
                path: "/",
                message: "The Category could not be created.",
            });
        },
    );
});

const categoryUpdateSchema = z.object({
    id: categoryFieldsValidators.id,
    name: categoryFieldsValidators.name,
    sortOrder: z.coerce.number().int().default(0),
});

categoryRouter.post("/update", zValidator("form", categoryUpdateSchema), c => {
    const input = c.req.valid("form");
    return updateCategory(input.id, input.name, input.sortOrder).match(
        () => successRedirect(c, { path: "/" }),
        error => {
            if (isDuplicateCategoryNameError(error)) {
                return errorRedirect(c, {
                    path: "/",
                    message: "A Category with that name already exists.",
                });
            }

            if (isNotFoundCategoryError(error)) {
                return errorRedirect(c, {
                    path: "/",
                    message: "Category not found.",
                });
            }

            return errorRedirect(c, {
                path: "/",
                message: "The Category could not be updated.",
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
                return errorRedirect(c, {
                    path: "/",
                    message: "Category not found.",
                });
            }

            return errorRedirect(c, {
                path: "/",
                message: "The Category could not be deleted.",
            });
        },
    );
});
