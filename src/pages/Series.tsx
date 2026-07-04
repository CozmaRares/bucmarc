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
            <div class="series">
                <div class="series-hero">
                    <h1 class="series-title">Series</h1>
                </div>
                <p>
                    <a href="/">Marks</a>
                </p>
                <section>
                    <h2 class="series-section-title">Create Series</h2>
                    <form
                        class="series-form"
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
                        <button type="submit">Create</button>
                    </form>
                </section>
                <section>
                    <h2 class="series-section-title">Saved Series</h2>
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
                </section>
                <EditSeriesDialog />
            </div>
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

function SeriesItem({ series }: SeriesItemProps) {
    return (
        <div
            class="series-card"
            data-series
            data-series-id={series.id}
            data-series-title={series.title}
            data-series-pattern={series.pattern}
            data-series-current-mark-url={series.markUrl ?? ""}
        >
            {series.markUrl ? (
                <a
                    class="series-card-title"
                    href={series.markUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    {series.title}
                </a>
            ) : (
                <span class="series-card-title">{series.title}</span>
            )}
            <dl class="series-card-details">
                <dt>Pattern</dt>
                <dd>{series.pattern}</dd>
                <dt>Current Mark</dt>
                <dd>{series.markUrl ?? "No current Mark"}</dd>
            </dl>
            <button
                class="series-card-edit"
                type="button"
                data-edit-series
            >
                Edit Series
            </button>
        </div>
    );
}

function EditSeriesDialog() {
    return (
        <div
            class="series-dialog"
            data-edit-series-dialog
            hidden
        >
            <h2 class="series-dialog-title">Edit Series</h2>
            <p
                class="series-dialog-summary"
                data-edit-series-dialog-mark-url
            />
            <form
                class="series-form"
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
                <button type="submit">Save</button>
            </form>
            <button
                class="series-dialog-cancel"
                type="button"
                data-edit-series-dialog-cancel
            >
                Cancel
            </button>
        </div>
    );
}

export const SeriesPage: Page<Props> = {
    name: "Series",
    component,
    dataLoader,
};
