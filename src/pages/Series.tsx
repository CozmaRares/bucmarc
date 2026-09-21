import { assetPath } from "@/lib/assets";
import type {
    RegexSnippet,
    Series,
    SeriesPageProps as Props,
} from "@/lib/services/loaders/Series";
import {
    SERIES_CREATE_URL,
    SERIES_DELETE_URL,
    SERIES_UPDATE_URL,
} from "@/routers/api/series";
import { PROVIDER_DETECT_URL } from "@/routers/api/patternTools";
import type { Page } from "./types";

function component({ series, snippets, createUrl }: Props) {
    return (
        <>
            <button
                class="series-create-series-button"
                type="button"
                data-create-series
            >
                Create Series
            </button>
            {series.length > 0 ? (
                <ul class="series-list">
                    {series.map(item => (
                        <li class="series-list-item">
                            <SeriesItem series={item} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No Series yet.</p>
            )}
            <CreateSeriesDialog
                snippets={snippets}
                createUrl={createUrl}
            />
            <EditSeriesDialog />
            <link
                rel="stylesheet"
                href={assetPath("/series/style.css")}
                precedence="page"
            />
            <script
                src={assetPath("/series/script.js")}
                defer
            />
        </>
    );
}

type SeriesItemProps = {
    series: Series;
};

const INDICAOTR_COLOR = {
    WITH_MARK: "#22C55E",
    WITHOUT_MARK: "#EAB308",
} as const;

function SeriesItem({ series }: SeriesItemProps) {
    return (
        <div
            class="series"
            data-series
            data-series-id={series.id}
            data-series-title={series.title}
            data-series-pattern={series.pattern}
            data-series-match-type={series.matchType}
        >
            <div
                class="series-link-indicator"
                style={`background-color: ${series.markUrl ? INDICAOTR_COLOR.WITH_MARK : INDICAOTR_COLOR.WITHOUT_MARK}`}
            />
            <span class="series-title">{series.title}</span>
            <button
                class="series-edit"
                type="button"
                data-edit-series
            >
                Edit
            </button>
        </div>
    );
}

function CreateSeriesDialog({
    snippets,
    createUrl,
}: {
    snippets: RegexSnippet[];
    createUrl: string | undefined;
}) {
    return (
        <div
            class="dialog"
            data-create-series-dialog
            data-create-series-dialog-url={createUrl}
            hidden
        >
            <div class="dialog-content">
                <h2 class="dialog-title">Create Series</h2>
                <form
                    class="dialog-form"
                    action={SERIES_CREATE_URL}
                    method="post"
                >
                    <label>
                        Title
                        <input
                            name="title"
                            type="text"
                            data-create-series-dialog-input-title
                            required
                        />
                    </label>
                    <label>
                        Match Type
                        <select
                            name="matchType"
                            required
                        >
                            <option value="deterministic">Deterministic</option>
                            <option value="ambiguous">Ambiguous</option>
                        </select>
                    </label>
                    <label>
                        Pattern
                        <textarea
                            name="pattern"
                            data-create-series-dialog-input-pattern
                            required
                        />
                    </label>
                    <div class="series-pattern-tools">
                        <button
                            type="button"
                            data-provider-detect
                            data-provider-detect-url={PROVIDER_DETECT_URL}
                        >
                            Detect provider
                        </button>
                        {snippets.map(snippet => (
                            <button
                                type="button"
                                data-regex-snippet={snippet.pattern}
                                disabled
                            >
                                {snippet.pattern}
                            </button>
                        ))}
                    </div>
                    <p
                        class="series-provider-message"
                        data-provider-detect-message
                        role="alert"
                        hidden
                    />
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-create-series-dialog-cancel
                        >
                            Cancel
                        </button>
                        <button
                            class="dialog-submit"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditSeriesDialog() {
    return (
        <div
            class="dialog"
            data-edit-series-dialog
            hidden
        >
            <div class="dialog-content">
                <h2 class="dialog-title">Edit Series</h2>
                <p
                    class="dialog-summary"
                    data-edit-series-dialog-title
                />
                <form
                    class="dialog-form"
                    action={SERIES_UPDATE_URL}
                    method="post"
                >
                    <input
                        name="id"
                        type="hidden"
                        data-edit-series-dialog-input-id
                    />
                    <label>
                        Title
                        <input
                            name="title"
                            type="text"
                            data-edit-series-dialog-input-title
                            required
                        />
                    </label>
                    <label>
                        Match Type
                        <select
                            name="matchType"
                            data-edit-series-dialog-input-match-type
                            required
                        >
                            <option value="deterministic">Deterministic</option>
                            <option value="ambiguous">Ambiguous</option>
                        </select>
                    </label>
                    <label>
                        Pattern
                        <textarea
                            name="pattern"
                            data-edit-series-dialog-input-pattern
                            required
                        />
                    </label>

                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-edit-series-dialog-cancel
                        >
                            Cancel
                        </button>
                        <button
                            class="dialog-submit"
                            type="submit"
                        >
                            Save
                        </button>
                    </div>
                </form>
                <form
                    class="dialog-form-delete"
                    action={SERIES_DELETE_URL}
                    method="post"
                    data-delete-series-form
                >
                    <input
                        name="id"
                        type="hidden"
                        data-edit-series-dialog-delete-id
                    />
                    <button type="submit">Delete</button>
                </form>
            </div>
        </div>
    );
}

export const SeriesPage: Page<Props> = {
    name: "Series",
    component,
};
