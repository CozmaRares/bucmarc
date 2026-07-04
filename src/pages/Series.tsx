import { getSeries } from "@/db/dal";
import type { Series } from "@/db/dal";
import { serverError, type Page, type PageLoadError } from "./types";
import type { Context } from "hono";
import { ResultAsync } from "neverthrow";

type Props = {
    pageMessage?: string;
    pageStatus?: string;
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

function component({ pageMessage, pageStatus, series }: Props) {
    return (
        <main>
            <h1>Series</h1>
            <p>
                <a href="/">Marks</a>
            </p>
            <p
                data-page-status={pageStatus ?? ""}
                data-page-banner
                role="alert"
                style={bannerStyle(pageStatus)}
                hidden={!pageMessage}
            >
                {pageMessage}
            </p>
            <section>
                <h2>Create Series</h2>
                <form
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
                <h2>Saved Series</h2>
                {series.length > 0 ? (
                    <ul>
                        {series.map(item => (
                            <li>
                                <SeriesItem series={item} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No Series yet.</p>
                )}
            </section>
            <EditSeriesDialog />
            <script
                src="/public/series/script.js"
                defer
            />
        </main>
    );
}

type SeriesItemProps = {
    series: Series;
};

function SeriesItem({ series }: SeriesItemProps) {
    return (
        <div
            data-series
            data-series-id={series.id}
            data-series-title={series.title}
            data-series-pattern={series.pattern}
            data-series-current-mark-url={series.markUrl ?? ""}
        >
            {series.markUrl ? (
                <a
                    href={series.markUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    {series.title}
                </a>
            ) : (
                <span>{series.title}</span>
            )}
            <dl>
                <dt>Pattern</dt>
                <dd>{series.pattern}</dd>
                <dt>Current Mark</dt>
                <dd>{series.markUrl ?? "No current Mark"}</dd>
            </dl>
            <button type="button" data-edit-series>
                Edit Series
            </button>
        </div>
    );
}

function EditSeriesDialog() {
    return (
        <dialog
            data-edit-series-dialog
            hidden
        >
            <h2>Edit Series</h2>
            <p data-edit-series-dialog-mark-url />
            <form
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
                type="button"
                data-edit-series-dialog-cancel
            >
                Cancel
            </button>
        </dialog>
    );
}

function bannerStyle(status?: string) {
    return status === "success"
        ? "border: 1px solid #175cd3; background: #eff8ff; color: #1849a9; padding: 0.75rem; margin: 0 0 1rem;"
        : "border: 1px solid #b42318; background: #fff4f2; color: #7a271a; padding: 0.75rem; margin: 0 0 1rem;";
}

export const SeriesPage: Page<Props> = { component, dataLoader };
