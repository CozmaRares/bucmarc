import { assetPath } from "@/lib/assets";
import { SERIES_MATCH_TYPES } from "@/lib/constants";
import type { ToolsPageProps as Props } from "@/lib/services/loaders/Tools";
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
import type { Page } from "./types";

const bookmarkletSave = `javascript:(function(){location.href='${env.APP_URL}${MARK_SAVE_URL_PREFIX}'+encodeURIComponent(location.href);})();`;
const bookmarkletSaveOpen = `javascript:(function(){location.href='${env.APP_URL}${MARK_SAVE_URL_PREFIX}'+encodeURIComponent(location.href)+'?no-redirect';})();`;
const bookmarkletCreateSeries = `javascript:(function(){location.href='${env.APP_URL}${SERIES_PAGE_URL}?createUrl='+encodeURIComponent(location.href);})();`;

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
                <form
                    action={PROVIDER_PATTERN_CREATE_URL}
                    method="post"
                    class="tools-provider-form tools-create-form"
                >
                    <label>
                        Pattern
                        <textarea
                            name="pattern"
                            required
                        />
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
                                    selected={matchType === "deterministic"}
                                >
                                    {matchType === "deterministic"
                                        ? "Deterministic"
                                        : "Ambiguous"}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="submit">Add</button>
                </form>
                <ul class="tools-list">
                    {providerPatterns.map(providerPattern => (
                        <li>
                            <form
                                action={PROVIDER_PATTERN_UPDATE_URL}
                                method="post"
                                class="tools-provider-form"
                            >
                                <textarea
                                    name="pattern"
                                    required
                                >
                                    {providerPattern.pattern}
                                </textarea>
                                <select
                                    name="matchType"
                                    required
                                >
                                    {SERIES_MATCH_TYPES.map(matchType => (
                                        <option
                                            value={matchType}
                                            selected={
                                                providerPattern.matchType ===
                                                matchType
                                            }
                                        >
                                            {matchType === "deterministic"
                                                ? "Deterministic"
                                                : "Ambiguous"}
                                        </option>
                                    ))}
                                </select>
                                <button type="submit">Save</button>
                                <input
                                    name="oldPattern"
                                    type="hidden"
                                    value={providerPattern.pattern}
                                />
                            </form>
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
                <h1>Bookmarklets</h1>
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

export const ToolsPage: Page<Props> = {
    name: "Tools",
    component,
};
