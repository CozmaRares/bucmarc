import {
    getProviderPatterns,
    getRegexSnippets,
    type ProviderPattern,
    type RegexSnippet,
} from "@/db/dal";
import { assetPath } from "@/lib/assets";
import { SERIES_MATCH_TYPES } from "@/lib/constants";
import { env } from "@/env";
import {
    PROVIDER_PATTERN_CREATE_URL,
    PROVIDER_PATTERN_DELETE_URL,
    PROVIDER_PATTERN_UPDATE_URL,
    REGEX_SNIPPET_CREATE_URL,
    REGEX_SNIPPET_DELETE_URL,
    REGEX_SNIPPET_UPDATE_URL,
} from "@/routers/api/patternTools";
import { MARK_SAVE_URL_PREFIX } from "@/routers/api/mark";
import { SERIES_PAGE_URL } from "@/routers/pagePaths";
import type { Context } from "hono";
import { ResultAsync } from "neverthrow";
import { serverError, type Page, type PageLoadError } from "./types";

type Props = {
    snippets: RegexSnippet[];
    providerPatterns: ProviderPattern[];
};

const bookmarkletSave = `javascript:(function(){location.href='${env.APP_URL}${MARK_SAVE_URL_PREFIX}'+encodeURIComponent(location.href);})();`;
const bookmarkletSaveOpen = `javascript:(function(){location.href='${env.APP_URL}${MARK_SAVE_URL_PREFIX}'+encodeURIComponent(location.href)+'?no-redirect';})();`;
const bookmarkletCreateSeries = `javascript:(function(){location.href='${env.APP_URL}${SERIES_PAGE_URL}?createUrl='+encodeURIComponent(location.href);})();`;

function dataLoader(c: Context): ResultAsync<Props, PageLoadError> {
    return ResultAsync.combine([getRegexSnippets(), getProviderPatterns()])
        .map(([snippets, providerPatterns]) => ({
            pageMessage: c.req.query("message"),
            pageStatus: c.req.query("status"),
            snippets,
            providerPatterns,
        }))
        .mapErr(serverError);
}

function component({ snippets, providerPatterns }: Props) {
    return (
        <>
            <section class="tools-section">
                <h1>Regex snippets</h1>
                <form
                    action={REGEX_SNIPPET_CREATE_URL}
                    method="post"
                    class="tools-create-form"
                >
                    <label>
                        Pattern
                        <textarea
                            name="pattern"
                            required
                        />
                    </label>
                    <button type="submit">Add</button>
                </form>
                <ul class="tools-list">
                    {snippets.map(snippet => (
                        <li>
                            <form
                                action={REGEX_SNIPPET_UPDATE_URL}
                                method="post"
                            >
                                <input
                                    name="oldPattern"
                                    type="hidden"
                                    value={snippet.pattern}
                                />
                                <textarea
                                    name="pattern"
                                    required
                                >
                                    {snippet.pattern}
                                </textarea>
                                <button type="submit">Save</button>
                            </form>
                            <form
                                action={REGEX_SNIPPET_DELETE_URL}
                                method="post"
                            >
                                <input
                                    name="pattern"
                                    type="hidden"
                                    value={snippet.pattern}
                                />
                                <button type="submit">Delete</button>
                            </form>
                        </li>
                    ))}
                </ul>
            </section>
            <section class="tools-section">
                <h1>Provider patterns</h1>
                <ProviderPatternForm
                    action={PROVIDER_PATTERN_CREATE_URL}
                    submitLabel="Add"
                />
                <ul class="tools-list">
                    {providerPatterns.map(providerPattern => (
                        <li>
                            <ProviderPatternForm
                                action={PROVIDER_PATTERN_UPDATE_URL}
                                submitLabel="Save"
                                providerPattern={providerPattern}
                            />
                            <form
                                action={PROVIDER_PATTERN_DELETE_URL}
                                method="post"
                            >
                                <input
                                    name="pattern"
                                    type="hidden"
                                    value={providerPattern.pattern}
                                />
                                <button type="submit">Delete</button>
                            </form>
                        </li>
                    ))}
                </ul>
            </section>
            <section class="tools-section">
                <h1>Bookmarklets (Mobile)</h1>
                <div class="tools-bookmarklet-item">
                    <button
                        class="tools-copy-button"
                        data-copy={bookmarkletSave}
                        title="Copy bookmarklet code"
                    >
                        Copy
                    </button>
                    <span>Save</span>
                </div>
                <div class="tools-bookmarklet-item">
                    <button
                        class="tools-copy-button"
                        data-copy={bookmarkletSaveOpen}
                        title="Copy bookmarklet code"
                    >
                        Copy
                    </button>
                    <span>Save & Open</span>
                </div>
                <div class="tools-bookmarklet-item">
                    <button
                        class="tools-copy-button"
                        data-copy={bookmarkletCreateSeries}
                        title="Copy bookmarklet code"
                    >
                        Copy
                    </button>
                    <span>Create Series</span>
                </div>
            </section>
            <link
                rel="stylesheet"
                href={assetPath("/tools/style.css")}
                precedence="page"
            />
        </>
    );
}

type ProviderPatternFormProps = {
    action: string;
    submitLabel: string;
    providerPattern?: ProviderPattern;
};

function ProviderPatternForm({
    action,
    submitLabel,
    providerPattern,
}: ProviderPatternFormProps) {
    return (
        <form
            action={action}
            method="post"
            class={`tools-provider-form${providerPattern ? "" : " tools-create-form"}`}
        >
            {providerPattern && (
                <input
                    name="oldPattern"
                    type="hidden"
                    value={providerPattern.pattern}
                />
            )}
            <label>
                Pattern
                <textarea
                    name="pattern"
                    required
                >
                    {providerPattern?.pattern}
                </textarea>
            </label>
            <label>
                Match type
                <select
                    name="matchType"
                    required
                >
                    {SERIES_MATCH_TYPES.map(matchType => (
                        <option
                            value={matchType}
                            selected={
                                providerPattern?.matchType === matchType ||
                                (!providerPattern &&
                                    matchType === "deterministic")
                            }
                        >
                            {matchType === "deterministic"
                                ? "Deterministic"
                                : "Ambiguous"}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">{submitLabel}</button>
        </form>
    );
}

export const ToolsPage: Page<Props> = {
    name: "Tools",
    component,
    dataLoader,
};
