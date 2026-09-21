import {
    createProviderPattern,
    createRegexSnippet,
    deleteProviderPattern,
    deleteRegexSnippet,
    isInvalidProviderPatternError,
    updateProviderPattern,
    updateRegexSnippet,
} from "@/db/dal";
import { SERIES_MATCH_TYPES } from "@/lib/constants";
import { detectProviderPattern } from "@/lib/services/patterns";
import { errorRedirect, HTTPStatus, successRedirect } from "@/honoHelpers";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { TOOLS_PAGE_URL } from "@/routers/pagePaths";

export const patternToolsRouter = new Hono();

const patternToolsValidators = {
    pattern: z.string().trim().min(1),
    matchType: z.enum(SERIES_MATCH_TYPES),
};

function toolsError(c: Parameters<typeof errorRedirect>[0], message: string) {
    return errorRedirect(c, { path: TOOLS_PAGE_URL, message });
}

const snippetSchema = z.object({
    pattern: patternToolsValidators.pattern,
});

export const REGEX_SNIPPET_CREATE_URL = "/api/pattern-tools/snippet/create";
patternToolsRouter.post(
    "/snippet/create",
    zValidator("form", snippetSchema),
    c =>
        createRegexSnippet(c.req.valid("form").pattern).match(
            () => successRedirect(c, { path: TOOLS_PAGE_URL }),
            () => toolsError(c, "The regex snippet could not be saved."),
        ),
);

const snippetUpdateSchema = z.object({
    pattern: patternToolsValidators.pattern,
    oldPattern: patternToolsValidators.pattern,
});

export const REGEX_SNIPPET_UPDATE_URL = "/api/pattern-tools/snippet/update";
patternToolsRouter.post(
    "/snippet/update",
    zValidator("form", snippetUpdateSchema),
    c => {
        const input = c.req.valid("form");
        return updateRegexSnippet(input.oldPattern, input.pattern).match(
            () => successRedirect(c, { path: TOOLS_PAGE_URL }),
            () => toolsError(c, "The regex snippet could not be updated."),
        );
    },
);

export const REGEX_SNIPPET_DELETE_URL = "/api/pattern-tools/snippet/delete";
patternToolsRouter.post(
    "/snippet/delete",
    zValidator("form", snippetSchema),
    c =>
        deleteRegexSnippet(c.req.valid("form").pattern).match(
            () => successRedirect(c, { path: TOOLS_PAGE_URL }),
            () => toolsError(c, "The regex snippet could not be deleted."),
        ),
);

function saveProvider(
    c: Parameters<typeof errorRedirect>[0],
    action: ReturnType<typeof createProviderPattern>,
    failureMessage: string,
) {
    return action.match(
        () => successRedirect(c, { path: TOOLS_PAGE_URL }),
        error =>
            toolsError(
                c,
                isInvalidProviderPatternError(error)
                    ? error.error
                    : failureMessage,
            ),
    );
}

const providerSchema = z.object({
    pattern: patternToolsValidators.pattern,
    matchType: patternToolsValidators.matchType,
});

export const PROVIDER_PATTERN_CREATE_URL = "/api/pattern-tools/provider/create";
patternToolsRouter.post(
    "/provider/create",
    zValidator("form", providerSchema),
    c => {
        const input = c.req.valid("form");
        return saveProvider(
            c,
            createProviderPattern(input.pattern, input.matchType),
            "The provider pattern could not be saved.",
        );
    },
);

const providerUpdateSchema = z.object({
    pattern: patternToolsValidators.pattern,
    matchType: patternToolsValidators.matchType,
    oldPattern: patternToolsValidators.pattern,
});

export const PROVIDER_PATTERN_UPDATE_URL = "/api/pattern-tools/provider/update";
patternToolsRouter.post(
    "/provider/update",
    zValidator("form", providerUpdateSchema),
    c => {
        const input = c.req.valid("form");
        return saveProvider(
            c,
            updateProviderPattern(
                input.oldPattern,
                input.pattern,
                input.matchType,
            ),
            "The provider pattern could not be updated.",
        );
    },
);

const providerDeleteSchema = z.object({
    pattern: patternToolsValidators.pattern,
});

export const PROVIDER_PATTERN_DELETE_URL = "/api/pattern-tools/provider/delete";
patternToolsRouter.post(
    "/provider/delete",
    zValidator("form", providerDeleteSchema),
    c =>
        deleteProviderPattern(c.req.valid("form").pattern).match(
            () => successRedirect(c, { path: TOOLS_PAGE_URL }),
            () => toolsError(c, "The provider pattern could not be deleted."),
        ),
);

const providerDetectSchema = z.object({
    pattern: patternToolsValidators.pattern,
});

export const PROVIDER_DETECT_URL = "/api/pattern-tools/provider/detect";
patternToolsRouter.post(
    "/provider/detect",
    zValidator("json", providerDetectSchema),
    async c => {
        const result = await detectProviderPattern(c.req.valid("json").pattern);
        return result.match(
            detection =>
                detection
                    ? c.json(detection)
                    : c.json(
                          { message: "No provider pattern matched." },
                          HTTPStatus.NotFound,
                      ),
            () =>
                c.json(
                    { message: "Provider detection failed." },
                    HTTPStatus.ServerError,
                ),
        );
    },
);
