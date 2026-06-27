import { registerPage } from "@/routers/utils";
import { SharePage } from "@/pages/Share";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import {
    deleteMarkByShareToken,
    revealCategoryByShareToken,
    saveMarkByShareToken,
    updateMarkTitleByShareToken,
} from "@/db/dal";
import { errorRedirect, successRedirect } from "@/honoHelpers";
import {
    isDuplicateMarkUrlError,
    isNotFoundCategoryError,
    isNotFoundMarkError,
    isShareTokenPermissionError,
} from "@/db/dal";
import { workerPool } from "@/lib/workerPool";

const shareRouter = new Hono();
export default shareRouter;

const shareMarkFieldValidators = {
    url: z.url(),
    title: z.preprocess(
        value =>
            typeof value === "string" && value.trim() === "" ? null : value,
        z.string().nullable().optional(),
    ),
};

shareRouter.get("/:token/mark/save", c => {
    const token = c.req.param("token");
    const url = c.req.query("url");

    if (!isSaveableUrl(url)) {
        return shareErrorRedirect(
            c,
            token,
            `The URL could not be saved because it is invalid: ${url ?? ""}`,
        );
    }

    return saveMarkByShareToken(token, url).match(
        () => {
            workerPool.dispatchWorker();
            return successRedirect(c, { path: url });
        },
        error => {
            if (isDuplicateMarkUrlError(error)) {
                return shareErrorRedirect(
                    c,
                    token,
                    "A Mark with that URL already exists.",
                );
            }

            if (isNotFoundCategoryError(error)) {
                return shareErrorRedirect(
                    c,
                    token,
                    "Shared Category not found.",
                );
            }

            if (isShareTokenPermissionError(error)) {
                return shareErrorRedirect(
                    c,
                    token,
                    "This Shared Category is read-only.",
                );
            }

            return shareErrorRedirect(c, token, "The Mark could not be added.");
        },
    );
});

const updateMarkTitleSchema = z.object({
    url: shareMarkFieldValidators.url,
    title: shareMarkFieldValidators.title,
});

shareRouter.post(
    "/:token/mark/update-title",
    zValidator("form", updateMarkTitleSchema),
    c => {
        const token = c.req.param("token");
        const input = c.req.valid("form");

        return updateMarkTitleByShareToken(token, input.url, input.title).match(
            () => successRedirect(c, { path: sharePath(token) }),
            error => {
                if (
                    isNotFoundCategoryError(error) ||
                    isNotFoundMarkError(error)
                ) {
                    return shareErrorRedirect(c, token, "Mark not found.");
                }

                if (isShareTokenPermissionError(error)) {
                    return shareErrorRedirect(
                        c,
                        token,
                        "This Shared Category is read-only.",
                    );
                }

                return shareErrorRedirect(
                    c,
                    token,
                    "The Mark could not be updated.",
                );
            },
        );
    },
);

const deleteMarkSchema = z.object({
    url: shareMarkFieldValidators.url,
});

shareRouter.post(
    "/:token/mark/delete",
    zValidator("form", deleteMarkSchema),
    c => {
        const token = c.req.param("token");
        const input = c.req.valid("form");

        return deleteMarkByShareToken(token, input.url).match(
            () => successRedirect(c, { path: sharePath(token) }),
            error => {
                if (
                    isNotFoundCategoryError(error) ||
                    isNotFoundMarkError(error)
                ) {
                    return shareErrorRedirect(c, token, "Mark not found.");
                }

                if (isShareTokenPermissionError(error)) {
                    return shareErrorRedirect(
                        c,
                        token,
                        "This Shared Category is read-only.",
                    );
                }

                return shareErrorRedirect(
                    c,
                    token,
                    "The Mark could not be deleted.",
                );
            },
        );
    },
);

shareRouter.post("/:token/share-only/disable", c => {
    const token = c.req.param("token");

    return revealCategoryByShareToken(token).match(
        () => successRedirect(c, { path: sharePath(token) }),
        error => {
            if (isNotFoundCategoryError(error)) {
                return shareErrorRedirect(
                    c,
                    token,
                    "Shared Category not found.",
                );
            }

            return shareErrorRedirect(
                c,
                token,
                "Share-Only could not be disabled.",
            );
        },
    );
});

registerPage(shareRouter, "/:token", SharePage);

function sharePath(token: string) {
    return `/share/${token}`;
}

function shareErrorRedirect(
    c: Parameters<typeof errorRedirect>[0],
    token: string,
    error: string,
) {
    return errorRedirect(c, { path: sharePath(token), message: error });
}

const saveUrlSchema = z.url().refine(url => {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
});

function isSaveableUrl(url: string | undefined): url is string {
    return saveUrlSchema.safeParse(url).success;
}
