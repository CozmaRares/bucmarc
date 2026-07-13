import { getSeries } from "@/db/dal";
import type { Series } from "@/db/dal";
import { serverError, type Page, type PageLoadError } from "./types";
import type { Context } from "hono";
import { ResultAsync } from "neverthrow";

type Props = {
    series: Series[];
};

function dataLoader(c: Context): ResultAsync<Props, PageLoadError> {
    return getSeries()
        .map(series => ({
            pageMessage: c.req.query("message"),
            pageStatus: c.req.query("status"),
            series,
        }))
        .mapErr(serverError);
}

function component({ series }: Props) {
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
            <CreateSeriesDialog />
            <EditSeriesDialog />
            <link
                rel="stylesheet"
                href="/public/series/style.css"
            />
            <script
                src="/public/series/script.js"
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

function CreateSeriesDialog() {
    return (
        <div
            class="dialog"
            data-create-series-dialog
            hidden
        >
            <div class="dialog-content">
                <h2 class="dialog-title">Create Series</h2>
                <form
                    class="dialog-form"
                    action="/api/series/create"
                    method="post"
                >
                    <label>
                        Title
                        <input
                            name="title"
                            type="text"
                            required
                        />
                    </label>
                    <label>
                        Pattern
                        <textarea
                            name="pattern"
                            required
                        />
                    </label>
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
                    action="/api/series/update"
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
                    action="/api/series/delete"
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
    dataLoader,
};
