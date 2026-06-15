import { Hono } from "hono";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import {
    createCategory,
    deleteCategory,
    disableCategorySharing,
    enableCategorySharing,
    renameCategory,
    setCategoryShareOnly,
    setCategoryTokenManageable,
} from "@/db";
import { errorRedirect, successRedirect } from "@/honoHelpers";
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
                message: "The Category could not be renamed.",
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

const categoryIdSchema = z.object({
    id: categoryFieldsValidators.id,
});

categoryRouter.post(
    "/share/enable",
    zValidator("form", categoryIdSchema),
    c => {
        const input = c.req.valid("form");
        return enableCategorySharing(input.id).match(
            token => shareUrlRedirect(c, token),
            error => {
                if (isNotFoundCategoryError(error)) {
                    return errorRedirect(c, {
                        path: "/",
                        message: "Category not found.",
                    });
                }

                return errorRedirect(c, {
                    path: "/",
                    message: "Sharing could not be enabled.",
                });
            },
        );
    },
);

categoryRouter.post(
    "/share/disable",
    zValidator("form", categoryIdSchema),
    c => {
        const input = c.req.valid("form");
        return disableCategorySharing(input.id).match(
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
                    message: "Sharing could not be disabled.",
                });
            },
        );
    },
);

categoryRouter.post(
    "/share/token-manageable/enable",
    zValidator("form", categoryIdSchema),
    c => {
        const input = c.req.valid("form");
        return setCategoryTokenManageable(input.id, true).match(
            () => successRedirect(c, { path: "/" }),
            error => {
                if (isNotFoundCategoryError(error)) {
                    return errorRedirect(c, {
                        path: "/",
                        message: "Shared Category not found.",
                    });
                }

                return errorRedirect(c, {
                    path: "/",
                    message: "Token-Manageable could not be enabled.",
                });
            },
        );
    },
);

categoryRouter.post(
    "/share/token-manageable/disable",
    zValidator("form", categoryIdSchema),
    c => {
        const input = c.req.valid("form");
        return setCategoryTokenManageable(input.id, false).match(
            () => successRedirect(c, { path: "/" }),
            error => {
                if (isNotFoundCategoryError(error)) {
                    return errorRedirect(c, {
                        path: "/",
                        message: "Shared Category not found.",
                    });
                }

                return errorRedirect(c, {
                    path: "/",
                    message: "Token-Manageable could not be disabled.",
                });
            },
        );
    },
);

categoryRouter.post(
    "/share/share-only/enable",
    zValidator("form", categoryIdSchema),
    c => {
        const input = c.req.valid("form");
        return setCategoryShareOnly(input.id, true).match(
            () => successRedirect(c, { path: "/" }),
            error => {
                if (isNotFoundCategoryError(error)) {
                    return errorRedirect(c, {
                        path: "/",
                        message: "Shared Category not found.",
                    });
                }

                return errorRedirect(c, {
                    path: "/",
                    message: "Share-Only could not be enabled.",
                });
            },
        );
    },
);

function buildShareUrl(token: string) {
    return new URL(`/share/${token}`, env.APP_URL).href;
}

function shareUrlRedirect(
    c: Parameters<typeof successRedirect>[0],
    token: string,
) {
    return successRedirect(c, {
        path: "/",
        message: `Share URL: ${buildShareUrl(token)}`,
    });
}
