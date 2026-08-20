import {
    getCategorizedMarks,
    getPendingAmbiguousMarks,
    getUncategorizedMarks,
} from "@/db/dal";
import type { Category, MarkWithSeries, PendingAmbiguousMark } from "@/db/dal";
import { assetPath } from "@/lib/assets";
import {
    CATEGORY_CREATE_URL,
    CATEGORY_DELETE_URL,
    CATEGORY_UPDATE_URL,
} from "@/routers/api/category";
import {
    MARK_DELETE_URL,
    MARK_OPEN_URL,
    MARK_RESOLVE_AMBIGUOUS_URL,
    MARK_UPDATE_URL,
} from "@/routers/api/mark";
import { serverError, type Page, type PageLoadError } from "./types";
import { ResultAsync } from "neverthrow";

type IndicatorStatus = "fresh" | "aging" | "stale" | "very-stale" | "ancient";

type MarkWithIndicators = MarkWithSeries & {
    ageIndicatorStatus: IndicatorStatus;
    lastClickedIndicatorStatus: IndicatorStatus;
};

type Props = {
    categorizedMarks: Array<Category & { marks: MarkWithIndicators[] }>;
    pendingAmbiguousMarks: PendingAmbiguousMark[];
    uncategorizedMarks: MarkWithIndicators[];
};

function dataLoader(): ResultAsync<Props, PageLoadError> {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const THRESHOLDS = [
        [7, "fresh"],
        [30, "aging"],
        [60, "stale"],
        [90, "very-stale"],
        [Infinity, "ancient"],
    ] as const;

    const now = Date.now();

    const getIndicatorStatus = (date: Date): IndicatorStatus => {
        const days = (now - date.getTime()) / MS_PER_DAY;
        const [, indicatorStatus] = THRESHOLDS.find(
            ([threshold]) => days < threshold,
        )!;
        return indicatorStatus;
    };

    const createMarkWithIndicators = (mark: MarkWithSeries) => {
        return {
            ...mark,
            ageIndicatorStatus: getIndicatorStatus(mark.createdAt),
            lastClickedIndicatorStatus: getIndicatorStatus(mark.lastClickedAt),
        };
    };

    return ResultAsync.combineWithAllErrors([
        getCategorizedMarks(),
        getPendingAmbiguousMarks(),
        getUncategorizedMarks(),
    ])
        .map(
            ([
                categorizedMarks,
                pendingAmbiguousMarks,
                uncategorizedMarks,
            ]) => ({
                categorizedMarks: categorizedMarks.map(category => ({
                    ...category,
                    marks: category.marks.map(createMarkWithIndicators),
                })),
                pendingAmbiguousMarks,
                uncategorizedMarks: uncategorizedMarks.map(
                    createMarkWithIndicators,
                ),
            }),
        )
        .mapErr(serverError);
}

function component({
    categorizedMarks,
    pendingAmbiguousMarks,
    uncategorizedMarks,
}: Props) {
    return (
        <>
            {uncategorizedMarks.length > 0 && (
                <section class="home-section">
                    <div class="home-section-header">
                        <h2 class="home-section-title">Marks</h2>
                        <button
                            class="home-create-category-button"
                            type="button"
                            data-create-category
                        >
                            Create Category
                        </button>
                    </div>

                    <ul class="home-list">
                        {uncategorizedMarks.map(markWithIndicators => (
                            <li class="home-list-item">
                                <MarkComponent
                                    markWithIndicators={markWithIndicators}
                                />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {categorizedMarks.map(category => (
                <section
                    class="home-section"
                    data-category
                    data-category-id={category.id}
                    data-category-name={category.name}
                    data-category-sort-order={category.sortOrder}
                >
                    <div class="home-section-header">
                        <h2 class="home-section-title">{category.name}</h2>
                        <button
                            class="home-edit-category-button"
                            type="button"
                            data-edit-category
                        >
                            Edit Category
                        </button>
                    </div>
                    {category.marks.length > 0 ? (
                        <ul class="home-list">
                            {category.marks.map(markWithIndicators => (
                                <li class="home-list-item">
                                    <MarkComponent
                                        markWithIndicators={markWithIndicators}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No marks in this category.</p>
                    )}
                </section>
            ))}
            <CreateCategoryDialog />
            <EditCategoryDialog />
            <EditMarkDialog categories={categorizedMarks} />
            <ResolveAmbiguousMarksDialog
                pendingAmbiguousMarks={pendingAmbiguousMarks}
            />
            <link
                rel="stylesheet"
                href={assetPath("/home/style.css")}
            />
            <script
                src={assetPath("/home/script.js")}
                defer
            />
        </>
    );
}

type ResolveAmbiguousMarksDialogProps = {
    pendingAmbiguousMarks: PendingAmbiguousMark[];
};

function ResolveAmbiguousMarksDialog({
    pendingAmbiguousMarks,
}: ResolveAmbiguousMarksDialogProps) {
    if (pendingAmbiguousMarks.length === 0) {
        return null;
    }

    return (
        <div
            class="dialog"
            data-resolve-ambiguous-marks-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-resolve-ambiguous-marks-dialog-content
            >
                <div class="dialog-header">
                    <h2 class="dialog-title">Resolve Marks</h2>
                </div>
                <form
                    class="dialog-form ambiguous-marks-form"
                    action={MARK_RESOLVE_AMBIGUOUS_URL}
                    method="post"
                >
                    <input
                        name="count"
                        type="hidden"
                        value={pendingAmbiguousMarks.length}
                    />
                    {pendingAmbiguousMarks.map((mark, index) => (
                        <fieldset class="ambiguous-mark">
                            <legend class="break">{mark.markUrl}</legend>
                            <input
                                name={`markUrl_${index}`}
                                type="hidden"
                                value={mark.markUrl}
                            />
                            <label>
                                Series
                                <select
                                    name={`seriesId_${index}`}
                                    required
                                >
                                    {mark.candidates.map(candidate => (
                                        <option
                                            value={candidate.seriesId}
                                            data-candidate-episode={
                                                candidate.manualEpisode
                                                    ? candidate.manualEpisode
                                                    : ""
                                            }
                                        >
                                            {candidate.seriesTitle}
                                        </option>
                                    ))}
                                    <option value="">No match</option>
                                </select>
                            </label>
                            <label>
                                Episode
                                <input
                                    name={`episode_${index}`}
                                    type="number"
                                    step="any"
                                    data-resolve-ambiguous-mark-episode
                                />
                            </label>
                        </fieldset>
                    ))}
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-resolve-ambiguous-marks-dialog-cancel
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

type MarkProps = {
    markWithIndicators: MarkWithIndicators;
};

function MarkComponent({ markWithIndicators }: MarkProps) {
    const { series, ...mark } = markWithIndicators;

    return (
        <div
            class="mark"
            data-mark
            data-mark-url={mark.url}
            data-mark-title={mark.title ?? ""}
            data-mark-category-id={mark.categoryId ?? ""}
        >
            <div
                class={`mark-indicator mark-indicator-age-${mark.ageIndicatorStatus} mark-indicator-clicked-${mark.lastClickedIndicatorStatus}`}
            />
            {series?.episode && (
                <span class="mark-episode">[{series.episode}]</span>
            )}
            <a
                class="mark-link"
                href={MARK_OPEN_URL(mark.url)}
            >
                {series?.title || mark.title || mark.url}
            </a>
            <button
                class="mark-edit"
                data-edit
            >
                Edit
            </button>
            <form
                action={MARK_DELETE_URL}
                method="post"
                data-delete-mark-form
            >
                <input
                    name="url"
                    type="hidden"
                    value={mark.url}
                />
                <button
                    class="mark-delete"
                    type="submit"
                >
                    Delete
                </button>
            </form>
        </div>
    );
}

function CreateCategoryDialog() {
    return (
        <div
            class="dialog"
            data-create-category-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-create-category-dialog-content
            >
                <h2 class="dialog-title">Create Category</h2>
                <form
                    class="dialog-form"
                    action={CATEGORY_CREATE_URL}
                    method="post"
                >
                    <label>
                        Category Name
                        <input
                            name="name"
                            type="text"
                            data-create-category-dialog-input-name
                            required
                        />
                    </label>
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-create-category-dialog-cancel
                        >
                            Cancel
                        </button>
                        <button
                            class="dialog-submit"
                            type="submit"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditCategoryDialog() {
    return (
        <div
            class="dialog"
            data-edit-category-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-edit-category-dialog-content
            >
                <div class="dialog-header">
                    <h2 class="dialog-title">Edit Category</h2>
                    <p
                        class="dialog-summary"
                        data-edit-category-dialog-name
                    />
                </div>
                <form
                    class="dialog-form"
                    action={CATEGORY_UPDATE_URL}
                    method="post"
                >
                    <input
                        name="id"
                        type="hidden"
                        data-edit-category-dialog-update-id
                    />
                    <label>
                        Category Name
                        <input
                            name="name"
                            type="text"
                            data-edit-category-dialog-input-name
                            required
                        />
                    </label>
                    <label>
                        Sort Order
                        <input
                            name="sortOrder"
                            type="number"
                            data-edit-category-dialog-input-sort-order
                            required
                        />
                    </label>
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-edit-category-dialog-cancel
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
                    action={CATEGORY_DELETE_URL}
                    method="post"
                    data-delete-category-form
                >
                    <input
                        name="id"
                        type="hidden"
                        data-edit-category-dialog-delete-id
                    />
                    <button type="submit">Delete</button>
                </form>
            </div>
        </div>
    );
}

type EditMarkDialogProps = {
    categories: Array<Pick<Category, "id" | "name">>;
};

function EditMarkDialog({ categories }: EditMarkDialogProps) {
    return (
        <div
            class="dialog"
            data-edit-mark-dialog
            hidden
        >
            <div
                class="dialog-content"
                data-edit-mark-dialog-content
            >
                <div class="dialog-header">
                    <h2 class="dialog-title">Edit Mark</h2>
                    <p
                        class="dialog-summary break"
                        data-edit-mark-dialog-url
                    />
                </div>
                <form
                    class="dialog-form"
                    action={MARK_UPDATE_URL}
                    method="post"
                >
                    <input
                        name="url"
                        type="hidden"
                        data-edit-mark-dialog-input-url
                    />
                    <label>
                        Title
                        <input
                            name="title"
                            type="text"
                            data-edit-mark-dialog-input-title
                        />
                    </label>
                    <label>
                        Category
                        <select
                            name="categoryId"
                            data-edit-mark-dialog-input-category
                        >
                            <option value="">Uncategorized</option>
                            {categories.map(category => (
                                <option value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div class="dialog-actions">
                        <button
                            class="dialog-cancel"
                            type="button"
                            data-edit-mark-dialog-cancel
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

export const HomePage: Page<Props> = {
    name: "Home",
    component,
    dataLoader,
};
